// fe/src/pages/admin/AdminApproval.jsx
import { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import { 
  getMyProjectsApi, 
  getPendingRequestsApi, 
  approveJoinRequestApi, 
  rejectJoinRequestApi, 
  approveLeaveRequestApi, 
  rejectLeaveRequestApi 
} from "../../api/projectApi";

export default function AdminApproval() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      
      // 1. Lấy danh sách các dự án để quét request
      const projectsRes = await getMyProjectsApi();
      const allRequests = [];

      // 2. Quét qua từng dự án để lấy Pending Requests
      await Promise.all(projectsRes.data.map(async (project) => {
        try {
          const reqRes = await getPendingRequestsApi(project._id);
          const projectData = reqRes.data;

          // Xử lý dữ liệu trả về (Giả định backend trả về object chứa 2 mảng)
          if (projectData.pendingJoinRequests) {
            projectData.pendingJoinRequests.forEach(user => {
              allRequests.push({
                id: `join_${project._id}_${user._id || user}`,
                projectId: project._id,
                userId: user._id || user,
                user: user.fullName || "Unknown User",
                avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.fullName || "U"}`,
                type: 'JOIN',
                project: project.name
              });
            });
          }

          if (projectData.pendingLeaveRequests) {
            projectData.pendingLeaveRequests.forEach(user => {
              allRequests.push({
                id: `leave_${project._id}_${user._id || user}`,
                projectId: project._id,
                userId: user._id || user,
                user: user.fullName || "Unknown User",
                avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.fullName || "U"}`,
                type: 'LEAVE',
                project: project.name
              });
            });
          }
        } catch (err) {
          console.error(`Error fetching requests for project ${project._id}`, err);
        }
      }));

      setRequests(allRequests);
    } catch (error) {
      console.error("Error loading approvals:", error);
      showToast("Failed to load pending requests.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (req) => {
    try {
      if (req.type === 'JOIN') {
        await approveJoinRequestApi(req.projectId, req.userId);
      } else {
        await approveLeaveRequestApi(req.projectId, req.userId);
      }
      showToast(`Approved request for ${req.user}.`);
      setRequests(requests.filter(r => r.id !== req.id));
    } catch (error) {
      showToast(error.response?.data?.message || "Error approving request.", "error");
    }
  };

  const handleReject = async (req) => {
    const confirmMsg = `Are you sure you want to reject this ${req.type.toLowerCase()} request from ${req.user}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      if (req.type === 'JOIN') {
        await rejectJoinRequestApi(req.projectId, req.userId);
      } else {
        await rejectLeaveRequestApi(req.projectId, req.userId);
      }
      showToast(`Rejected request for ${req.user}.`);
      setRequests(requests.filter(r => r.id !== req.id));
    } catch (error) {
      showToast(error.response?.data?.message || "Error rejecting request.", "error");
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col relative">
      <Header />

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed top-20 right-8 text-white px-6 py-3 rounded-lg shadow-lg z-[100] animate-fade-in-up font-semibold text-sm flex items-center ${toast.type === 'error' ? 'bg-red-600' : 'bg-slate-800'}`}>
          {toast.type === 'error' ? (
             <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ) : (
             <svg className="w-5 h-5 mr-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          )}
          {toast.message}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          
          {/* HEADER PAGE */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pending Approvals</h1>
            <p className="text-slate-500 text-sm mt-1">
              Review and manage project access requests from your team members.
            </p>
          </div>

          {/* METRICS CARD (Tùy chọn hiển thị số lượng) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{requests.length}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Requests</p>
              </div>
            </div>
            {/* Có thể thêm các thẻ thống kê khác nếu cần */}
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Requests List</h2>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-16 animate-fade-in-up">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">All caught up!</h3>
                  <p className="text-slate-500 mt-1 text-sm">There are no pending requests to review at this time.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-4">Requester</th>
                      <th className="px-6 py-4">Project</th>
                      <th className="px-6 py-4">Request Type</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition group">
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <img src={req.avatar} alt="avatar" className="w-9 h-9 rounded-full border border-slate-200 object-cover" />
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{req.user}</p>
                              <p className="text-xs text-slate-500">{req.userId.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-semibold text-slate-700">{req.project}</p>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border
                            ${req.type === 'JOIN' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}
                          >
                            {req.type === 'JOIN' ? 'Join Project' : 'Leave Project'}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-3">
                            <button 
                              onClick={() => handleReject(req)}
                              className="px-4 py-1.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-red-600 hover:border-red-200 rounded-lg text-xs font-bold transition"
                            >
                              Reject
                            </button>
                            <button 
                              onClick={() => handleApprove(req)}
                              className="px-4 py-1.5 bg-[#0b57d0] text-white hover:bg-blue-700 rounded-lg text-xs font-bold shadow-sm transition"
                            >
                              Approve
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}