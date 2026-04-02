// fe/src/pages/admin/AdminApproval.jsx
import { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import { formatDistanceToNow, differenceInMinutes, differenceInDays } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { io } from "socket.io-client";
import {getAllSupportTicketsApi} from "../../api/supportApi";

import { getMyProjectsApi, getPendingRequestsApi, approveJoinRequestApi, rejectJoinRequestApi, approveLeaveRequestApi, rejectLeaveRequestApi } from "../../api/projectApi";
import { getAllUsersApi, updateUserRoleApi, deleteUserApi, createUserApi } from "../../api/userApi"; 

export default function AdminApproval() {
  const api = import.meta.env.VITE_API_URL;

  const { user } = useAuth(); // Lấy thông tin người đang đăng nhập
  const [activeTab, setActiveTab] = useState("approvals"); 

  // ==== PENDING APPROVALS STATES ====
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ==== USER MANAGEMENT STATES ====
  const [users, setUsers] = useState([]); 
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [openActionMenuId, setOpenActionMenuId] = useState(null); 

  // ==== PAGINATION STATES ====
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5; 

  // ==== GLOBAL TOAST ====
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const [supportTickets, setSupportTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  const fetchTickets = async () => {
    try {
      setIsLoadingTickets(true);
      const res = await getAllSupportTicketsApi();
      setSupportTickets(res.data);
    } catch (error) {
      console.error("Lỗi tải tickets", error);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const projectsRes = await getMyProjectsApi();
      const allRequests = [];
      await Promise.all(projectsRes.data.map(async (project) => {
        try {
          const reqRes = await getPendingRequestsApi(project._id);
          const projectData = reqRes.data;
          if (projectData.pendingJoinRequests) {
            projectData.pendingJoinRequests.forEach(u => {
              allRequests.push({ id: `join_${project._id}_${u._id || u}`, projectId: project._id, userId: u._id || u, user: u.fullName || "Unknown User", avatar: u.avatar || `https://ui-avatars.com/api/?name=${u.fullName || "U"}`, type: 'JOIN', project: project.name });
            });
          }
          if (projectData.pendingLeaveRequests) {
            projectData.pendingLeaveRequests.forEach(u => {
              allRequests.push({ id: `leave_${project._id}_${u._id || u}`, projectId: project._id, userId: u._id || u, user: u.fullName || "Unknown User", avatar: u.avatar || `https://ui-avatars.com/api/?name=${u.fullName || "U"}`, type: 'LEAVE', project: project.name });
            });
          }
        } catch (err) { console.error(err); }
      }));
      setRequests(allRequests);
    } catch (error) { showToast("Failed to load pending requests.", "error"); } finally { setIsLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const res = await getAllUsersApi();
      setUsers(res.data);
    } catch (error) {
      showToast("Lỗi khi tải danh sách nhân viên.", "error");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'approvals') fetchRequests();
    if (activeTab === 'users' && users.length === 0) fetchUsers(); 
    if (activeTab === 'support' && supportTickets.length === 0) fetchTickets();
  }, [activeTab]);



  // Reset về trang 1 
  useEffect(() => {
    setCurrentPage(1);
  }, [searchUser, roleFilter]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    fullName: "", email: "", password: "", role: "Member", jobTitle: ""
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setIsCreatingUser(true);
      const res = await createUserApi(newUserForm);
     
      setUsers([res.data.user, ...users]); 
      showToast(res.data.message || "User created successfully!");
      
      // Đóng modal & Reset form
      setShowAddUserModal(false);
      setNewUserForm({ fullName: "", email: "", password: "", role: "Member", jobTitle: "" });
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to create user", "error");
    } finally {
      setIsCreatingUser(false);
    }
  };

  //socket
  useEffect(() => {
    const socket = io(`${api}`);

    socket.on("new_support_ticket", (newTicket) => {
      console.log("🔥 Có nhân viên vừa kêu cứu!");
      // Nhét thẳng tin nhắn mới lên ĐẦU danh sách
      setSupportTickets(prev => [newTicket, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'Member' : 'admin';
    const confirmMsg = `Change this user's role to ${newRole.toUpperCase()}?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      await updateUserRoleApi(userId, newRole);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      showToast(`Role changed to ${newRole}!`);
    } catch (error) {
      showToast(error.response?.data?.message || "Error changing role", "error");
    }
    setOpenActionMenuId(null);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`WARNING: Are you sure you want to permanently delete [${userName}] from the system? This action cannot be undone!`)) return;

    try {
      await deleteUserApi(userId);
      setUsers(users.filter(u => u._id !== userId));
      showToast(`Deleted account ${userName}`, "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Error deleting user", "error");
    }
    setOpenActionMenuId(null);
  };

  const handleApprove = async (req) => { try { if (req.type === 'JOIN') { await approveJoinRequestApi(req.projectId, req.userId); } else { await approveLeaveRequestApi(req.projectId, req.userId); } showToast(`Approved request for ${req.user}.`); setRequests(requests.filter(r => r.id !== req.id)); } catch (error) { showToast("Error approving request.", "error"); } };
  const handleReject = async (req) => { if (!window.confirm(`Reject this request?`)) return; try { if (req.type === 'JOIN') { await rejectJoinRequestApi(req.projectId, req.userId); } else { await rejectLeaveRequestApi(req.projectId, req.userId); } showToast(`Rejected request for ${req.user}.`); setRequests(requests.filter(r => r.id !== req.id)); } catch (error) { showToast("Error rejecting request.", "error"); } };

  useEffect(() => {
    const handleClickOutside = () => setOpenActionMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const getUserStatus = (lastLogin) => {
    if (!lastLogin) return { label: 'Inactive', color: 'bg-slate-400', text: 'Never logged in' };

    const loginDate = new Date(lastLogin);
    const minsDiff = differenceInMinutes(new Date(), loginDate);
    const daysDiff = differenceInDays(new Date(), loginDate);

    if (minsDiff < 5) {
      return { label: 'Online', color: 'bg-emerald-500', text: 'Active now' };
    }
    else if (daysDiff < 7) {
      return { label: 'Offline', color: 'bg-amber-400', text: `Last active ${formatDistanceToNow(loginDate, { addSuffix: true })}` };
    }
    else {
      return { label: 'Inactive', color: 'bg-rose-500', text: `Away for ${daysDiff} days` };
    }
  }

  // Lọc danh sách users
  const filteredUsers = users.filter(u => {
    const matchSearch = (u.fullName || '').toLowerCase().includes(searchUser.toLowerCase()) || (u.email || '').toLowerCase().includes(searchUser.toLowerCase());
    const matchRole = roleFilter === "All" || u.role?.toLowerCase() === roleFilter.toLowerCase();
    return matchSearch && matchRole;
  });

  // TÍNH TOÁN PHÂN TRANG
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col relative">
      <Header />

      {toast.show && (
        <div className={`fixed top-20 right-8 text-white px-6 py-3 rounded-lg shadow-lg z-[100] animate-fade-in-up font-semibold text-sm flex items-center ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Workspace Administration</h1>
            <p className="text-slate-500 text-sm mt-1">Manage team members, roles, and project access requests.</p>
          </div>

          <div className="flex space-x-8 border-b border-slate-200 mb-8">
            <button 
              onClick={() => setActiveTab('approvals')}
              className={`pb-3 text-sm font-bold border-b-2 transition-colors relative ${activeTab === 'approvals' ? 'border-[#0b57d0] text-[#0b57d0]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Pending Approvals
              {requests.length > 0 && <span className="ml-2 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{requests.length}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'users' ? 'border-[#0b57d0] text-[#0b57d0]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              User Management
            </button>

            <button 
              onClick={() => setActiveTab('support')}
              className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'support' ? 'border-[#0b57d0] text-[#0b57d0]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Support Tickets
            </button>
          </div>

          {/* ========================================= */}
          {/* TAB 1: PENDING APPROVALS CONTENT */}
          {/* ========================================= */}
          {activeTab === 'approvals' && (
            <div className="animate-fade-in-up">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50"><h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Requests List</h2></div>
                <div className="overflow-x-auto min-h-[300px]">
                  {isLoading ? ( <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div> ) 
                  : requests.length === 0 ? ( <div className="text-center py-16"><div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">🕊️</div><h3 className="text-lg font-bold text-slate-700">All caught up!</h3></div> ) 
                  : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                          <th className="px-6 py-4">Requester</th><th className="px-6 py-4">Project</th><th className="px-6 py-4">Request Type</th><th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {requests.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50/80 transition group">
                            <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center space-x-3"><img src={req.avatar} alt="avatar" className="w-9 h-9 rounded-full border border-slate-200 object-cover" /><div><p className="text-sm font-semibold text-slate-800">{req.user}</p></div></div></td>
                            <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm font-semibold text-slate-700">{req.project}</p></td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${req.type === 'JOIN' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>{req.type}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button onClick={() => handleReject(req)} className="px-4 py-1.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-red-600 hover:border-red-200 rounded-lg text-xs font-bold transition mr-2">Reject</button>
                              <button onClick={() => handleApprove(req)} className="px-4 py-1.5 bg-[#0b57d0] text-white hover:bg-blue-700 rounded-lg text-xs font-bold shadow-sm transition">Approve</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB 2: USER MANAGEMENT CONTENT            */}
          {/* ========================================= */}
          {activeTab === 'users' && (
            <div className="animate-fade-in-up">
              
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-72">
                    <input 
                      type="text" placeholder="Search by name or email..." 
                      value={searchUser} onChange={(e) => setSearchUser(e.target.value)}
                      className="block w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#0b57d0] outline-none transition text-slate-700 shadow-sm"
                    />
                  </div>
                  <select 
                    value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b57d0] focus:ring-2 focus:ring-blue-100 shadow-sm cursor-pointer"
                  >
                    <option value="All">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="Member">Member</option>
                  </select>
                  <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-[#0b57d0] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-sm transition active:scale-95 flex items-center w-full sm:w-auto justify-center"
                >
                  <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                  Add New Member
                </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible flex flex-col">
                <div className="overflow-x-auto min-h-[400px]">
                  {isLoadingUsers ? (
                     <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                  ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                        <th className="px-6 py-4">Member</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Joined Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentUsers.length === 0 ? (
                        <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500 text-sm font-medium">No users found.</td></tr>
                      ) : (
                        currentUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-slate-50/80 transition group">
                            
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.fullName}&background=0D8ABC&color=fff`} alt="avatar" className="w-9 h-9 rounded-full border border-slate-200 object-cover" />
                                <div>
                                  <p className="text-sm font-bold text-slate-800">{u.fullName}</p>
                                  <p className="text-xs text-slate-500">{u.email}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border
                                ${u.role === 'admin' || u.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                                  'bg-slate-100 text-slate-600 border-slate-200'}`}
                              >
                                {u.role === 'admin' ? 'Admin' : 'Member'}
                              </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              {(() => {
                                const statusData = getUserStatus(u.lastLogin);
                                return (
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <span className={`w-2.5 h-2.5 rounded-full ${statusData.color} shadow-sm animate-pulse`}></span>
                                      <span className="text-sm font-bold text-slate-700">{statusData.label}</span>
                                    </div>
                                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5 ml-4">
                                      {statusData.text}
                                    </p>
                                  </div>
                                );
                              })()}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm font-medium text-slate-600">
                                {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-right relative">
                              
                              {(u._id === user?._id || u._id === user?.id) ? (
                                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-400 text-xs font-bold rounded-lg cursor-not-allowed">
                                  You
                                </span>
                              ) : (
                                <>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === u._id ? null : u._id); }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition focus:outline-none"
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                    </svg>
                                  </button>

                                  {/* Dropdown Menu */}
                                  {openActionMenuId === u._id && (
                                    <div className="absolute right-8 top-10 mt-1 w-56 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 z-50 overflow-hidden text-left animate-fade-in-up">
                                      <div className="py-1">
                                        <button 
                                          onClick={() => handleChangeRole(u._id, u.role)}
                                          className="w-full px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center transition"
                                        >
                                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                          {u.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'}
                                        </button>
                                      </div>
                                      <div className="border-t border-slate-100 py-1">
                                        <button 
                                          onClick={() => handleDeleteUser(u._id, u.fullName)}
                                          className="w-full px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center transition"
                                        >
                                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                          Delete Account
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  )}
                </div>

                {/* THÊM THANH PHÂN TRANG Ở ĐÂY */}
                {!isLoadingUsers && filteredUsers.length > usersPerPage && (
                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <p className="text-sm text-slate-500 font-medium">
                      Showing <span className="font-bold text-slate-800">{indexOfFirstUser + 1}</span> to <span className="font-bold text-slate-800">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of <span className="font-bold text-slate-800">{filteredUsers.length}</span> users
                    </p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => paginate(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Previous
                      </button>
                      <button 
                        onClick={() => paginate(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB 3: SUPPORT TICKETS (HÒM THƯ GÓP Ý)      */}
          {/* ========================================= */}
          {activeTab === 'support' && (
            <div className="animate-fade-in-up">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                   <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">User Feedbacks & Issues</h2>
                 </div>
                 
                 {/* Khung chứa tin nhắn */}
                 {/* Khung chứa tin nhắn */}
                 <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                    {isLoadingTickets ? (
                      <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>
                    ) : supportTickets.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 text-sm font-medium">Hòm thư trống. Nhân viên đang rất vui vẻ! 🎉</div>
                    ) : (
                      supportTickets.map((ticket) => (
                        <div key={ticket._id} className="p-6 hover:bg-slate-50 transition group">
                           <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={ticket.user?.avatar || `https://ui-avatars.com/api/?name=${ticket.user?.fullName || "U"}`} 
                                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                  alt="avatar"
                                />
                                <div>
                                  <p className="text-sm font-bold text-slate-800">{ticket.user?.fullName || "Unknown User"}</p>
                                  <p className="text-xs font-semibold text-slate-400">{ticket.user?.email || "No email"}</p>
                                </div>
                              </div>
                              <span className="text-[11px] font-bold text-slate-400 uppercase">
                                {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                              </span>
                           </div>
                           
                           <div className="mt-4 pl-13">
                             <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                               {ticket.message}
                             </p>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-bold text-[#1B2559] flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                Create New Member
              </h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-lg transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Full Name</label>
                <input type="text" required placeholder="E.g. Nguyen Van A" value={newUserForm.fullName} onChange={(e) => setNewUserForm({...newUserForm, fullName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm font-bold text-slate-800 transition" />
              </div>
              
              <div>
                <label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Email Address</label>
                <input type="email" required placeholder="E.g. nv.a@company.com" value={newUserForm.email} onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm font-bold text-slate-800 transition" />
              </div>

              <div>
                <label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Temporary Password</label>
                <input type="password" required placeholder="Minimum 6 characters" minLength={6} value={newUserForm.password} onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm font-bold text-slate-800 transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Role</label>
                  <select value={newUserForm.role} onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm font-bold text-slate-700 cursor-pointer transition">
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Job Title</label>
                  <input type="text" placeholder="E.g. Developer, Designer" value={newUserForm.jobTitle} onChange={(e) => setNewUserForm({...newUserForm, jobTitle: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm font-bold text-slate-800 transition" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setShowAddUserModal(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                <button type="submit" disabled={isCreatingUser} className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition flex items-center ${isCreatingUser ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#0b57d0] hover:bg-blue-700 active:scale-95'}`}>
                  {isCreatingUser ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    
  );
}