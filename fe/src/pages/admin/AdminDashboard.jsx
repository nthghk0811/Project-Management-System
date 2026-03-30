// fe/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { getAllUsersApi } from "../../api/userApi";
import { 
  getTaskStatisticsApi, 
  getPerformanceDataApi, 
  getRecentActivitiesApi, 
  getTeamWorkloadApi,

   
} from "../../api/taskApi"; 
import { sendGlobalNotificationApi, sendPrivateNotificationApi } from "../../api/notificationApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ statusStats: [], priorityStats: [] });
  const [performance, setPerformance] = useState([]);
  const [activities, setActivities] = useState([]);
  const [workloadData, setWorkloadData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ==== STATES CHO LOA PHƯỜNG ====
  const [notiTitle, setNotiTitle] = useState("");
  const [notiDesc, setNotiDesc] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState(null);

  const [users, setUsers] = useState([]);
  const [targetUser, setTargetUser] = useState("ALL"); // Mặc định là gửi All

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Bắn 4 API song song để lấy toàn bộ dữ liệu vũ trụ
        const [statsRes, perfRes, activitiesRes, workloadRes, usersRes] = await Promise.all([
          getTaskStatisticsApi(),
          getPerformanceDataApi(),
          getRecentActivitiesApi(),
          getTeamWorkloadApi(),
          getAllUsersApi()
        ]);
        
        setStats(statsRes.data);
        setPerformance(perfRes.data.performanceData || []);
        setActivities(activitiesRes.data);
        setWorkloadData(workloadRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu Admin Dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalTasks = stats.statusStats.reduce((sum, item) => sum + item.value, 0);

  // ==== HÀM GỬI LOA PHƯỜNG ====
  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!notiTitle.trim() || !notiDesc.trim()) return;

    try {
      setIsSending(true);
      if (targetUser === "ALL") {
        await sendGlobalNotificationApi({ title: notiTitle, desc: notiDesc });
        showToast("Global announcement sent successfully!");
      } else {
        await sendPrivateNotificationApi({ recipientId: targetUser, title: notiTitle, desc: notiDesc });
        showToast("Private message sent successfully!");
      }
      setNotiTitle("");
      setNotiDesc("");
    } catch (error) {
      showToast(error.response?.data?.message || "Error sending notification", "error");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return <div className="h-screen flex flex-col bg-slate-50"><Header /><div className="flex flex-1"><Sidebar /><div className="flex-1 flex items-center justify-center text-slate-500 font-medium"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div> Loading Command Center...</div></div></div>;

  return (
    <div className="bg-[#f4f7fe] min-h-screen font-sans flex flex-col relative">
      <Header />
      
      {toast && (
        <div className={`fixed top-20 right-8 text-white px-6 py-3 rounded-lg shadow-2xl z-[100] animate-fade-in-up font-semibold text-sm flex items-center ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1B2559] tracking-tight">Command Center</h1>
            <p className="text-slate-500 text-sm mt-1">Global system overview, analytics, and team management.</p>
          </div>

          {/* DÒNG 1: THỐNG KÊ NHANH (BỐ CỤC 4 Ô) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.statusStats.map((s, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-300 transition">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-blue-500 transition">{s.name} Tasks</p>
                  <p className="text-3xl font-extrabold text-slate-800 mt-1">{s.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${s.color}20`, color: s.color }}>
                  {s.name === 'Done' ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> :
                   s.name === 'In Progress' ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> :
                   s.name === 'In Review' ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> :
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                  }
                </div>
              </div>
            ))}
          </div>

          {/* DÒNG 2: BIỂU ĐỒ HIỆU SUẤT & LOA PHƯỜNG */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* BIỂU ĐỒ HIỆU SUẤT (Chiếm 2 phần) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
              <h2 className="text-lg font-bold text-slate-800 mb-1">Company Performance</h2>
              <p className="text-xs text-slate-500 mb-6">New vs Completed tasks over the last 6 months.</p>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} />
                    <Bar dataKey="target" name="New Assigned Tasks" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="achieved" name="Completed Tasks" fill="#0b57d0" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* KHU VỰC LOA PHƯỜNG (Chiếm 1 phần) */}
            {/* KHU VỰC GIAO TIẾP (LOA PHƯỜNG & DIRECT MESSAGE) */}
            <div className={`rounded-2xl border shadow-sm flex flex-col h-[420px] overflow-hidden relative transition-colors duration-300 ${targetUser === "ALL" ? 'bg-white border-amber-200' : 'bg-white border-blue-200'}`}>
              
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 pointer-events-none transition-colors ${targetUser === "ALL" ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
              
              <div className="p-6 border-b border-slate-100 relative z-10 flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors ${targetUser === "ALL" ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                   {targetUser === "ALL" ? (
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                   ) : (
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                   )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                    {targetUser === "ALL" ? "Global Broadcast" : "Direct Message"}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {targetUser === "ALL" ? "Send to all members" : "Send private alert"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendAnnouncement} className="p-6 flex-1 flex flex-col relative z-10">
                <div className="space-y-4 flex-1">
                  
                  {/* DROPDOWN CHỌN NGƯỜI NHẬN */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">To</label>
                    <select 
                      value={targetUser} 
                      onChange={(e) => setTargetUser(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm cursor-pointer"
                    >
                      <option value="ALL">🔊 All Users (Global)</option>
                      <optgroup label="Direct Message (Individuals)">
                        {users.map(u => (
                           <option key={u._id} value={u._id}>👤 {u.fullName} ({u.email})</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subject</label>
                    <input type="text" required placeholder={targetUser === "ALL" ? "E.g. System Maintenance..." : "E.g. Task Follow-up"} value={notiTitle} onChange={(e) => setNotiTitle(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm font-semibold text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Message</label>
                    <textarea required rows="2" placeholder="Type your message here..." value={notiDesc} onChange={(e) => setNotiDesc(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm resize-none font-medium text-slate-700"></textarea>
                  </div>
                </div>

                <button type="submit" disabled={isSending} className={`mt-3 w-full py-2.5 rounded-lg text-sm font-bold shadow-sm transition flex items-center justify-center text-white ${isSending ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'} ${targetUser === "ALL" ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#0b57d0] hover:bg-blue-700'}`}>
                  {isSending ? (
                    <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sending...</>
                  ) : (
                    <><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg> {targetUser === "ALL" ? "Send Broadcast" : "Send Private Message"}</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* DÒNG 3: HOẠT ĐỘNG GẦN ĐÂY & WORKLOAD (Chia đều 50/50) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            
            {/* HOẠT ĐỘNG GẦN ĐÂY */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[400px]">
              <h2 className="font-bold text-slate-800 text-lg mb-1">Recent Activity</h2>
              <p className="text-xs text-slate-500 mb-6">Latest updates across all projects in the workspace.</p>

              <div className="flex-1 overflow-y-auto pr-2 space-y-5">
                {activities.length > 0 ? (
                  activities.map((act, index) => (
                    <div key={index} className="flex space-x-3 items-start group">
                      <img src={act.user?.avatar || `https://ui-avatars.com/api/?name=${act.user?.fullName || "U"}`} className="w-8 h-8 rounded-full border border-slate-200 object-cover flex-shrink-0" alt="avatar" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-slate-600 leading-snug">
                          <span className="font-bold text-slate-800 group-hover:text-blue-600 transition">{act.user?.fullName || "User"}</span>
                          <span className="mx-1.5">{act.action}</span>
                          <span className="font-bold text-slate-700">{act.taskTitle}</span>
                        </p>
                        <p className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                          {formatDistanceToNow(new Date(act.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-400 text-sm mt-10">No recent activity found.</div>
                )}
              </div>
            </div>

            {/* TEAM WORKLOAD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[400px]">
              <h2 className="font-bold text-slate-800 text-lg mb-1">Company Workload</h2>
              <p className="text-xs text-slate-500 mb-6">Monitor task distribution across all team members.</p>

              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                <span className="w-2/5">Assignee</span>
                <span className="w-3/5">Work Distribution</span>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-5">
                {workloadData.length === 0 ? (
                   <div className="text-center text-slate-400 text-sm mt-10">No tasks assigned yet.</div>
                ) : (
                  workloadData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between group">
                      
                      <div className="w-2/5 flex items-center space-x-3">
                        {item.assigneeName === "Unassigned" ? (
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400 flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                          </div>
                        ) : (
                          <img src={item.assigneeAvatar || `https://ui-avatars.com/api/?name=${item.assigneeName}`} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-700 truncate" title={item.assigneeName}>{item.assigneeName}</p>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase">{item.count} tasks</p>
                        </div>
                      </div>

                      <div className="w-3/5 flex items-center pl-4">
                        <div className="bg-slate-200 h-2.5 w-full rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${item.percentage > 40 ? 'bg-rose-500' : item.percentage > 20 ? 'bg-amber-500' : 'bg-blue-500'}`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-600 w-10 text-right ml-2">{item.percentage}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}