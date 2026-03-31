import { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip } from "recharts";
import { formatDistanceToNow } from "date-fns";
import { getTaskStatisticsApi, getRecentActivitiesApi, getTeamWorkloadApi } from "../api/taskApi";

export default function Dashboard() {
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workloadData, setWorkloadData] = useState([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, activitiesRes, workloadRes] = await Promise.all([
        getTaskStatisticsApi(),
        getRecentActivitiesApi(),
        getTeamWorkloadApi()
      ]);
      setStatusData(statsRes.data.statusStats);
      setPriorityData(statsRes.data.priorityStats);
      setActivities(activitiesRes.data);
      setWorkloadData(workloadRes.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu Dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalTasks = statusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-[#f4f7fe] min-h-screen font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">

          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#1B2559] tracking-tight">Dashboard</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Get a snapshot of the status of your work items.</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b57d0]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* ================= STATUS OVERVIEW ================= */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                <h2 className="font-bold text-[#1B2559] text-lg tracking-tight">Status overview</h2>
                <p className="text-xs text-slate-500 font-medium mb-6">Snapshot of your work items by phase.</p>

                <div className="flex-1 relative min-h-[250px] flex items-center">
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 pr-[120px]">
                    <span className="text-4xl font-extrabold text-[#1B2559] tracking-tighter">{totalTasks}</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Items</span>
                  </div>

                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} innerRadius={85} outerRadius={115} paddingAngle={3} dataKey="value" stroke="none">
                        {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <PieTooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                      <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: "13px", fontWeight: 600, color: "#475569", paddingLeft: "20px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ================= PRIORITY BREAKDOWN ================= */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                <h2 className="font-bold text-[#1B2559] text-lg tracking-tight">Priority breakdown</h2>
                <p className="text-xs text-slate-500 font-medium mb-6">Holistic view of work prioritization.</p>

                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }} />
                      <BarTooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {priorityData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ================= RECENT ACTIVITY ================= */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[400px]">
                <h2 className="font-bold text-[#1B2559] text-lg tracking-tight">Recent activity</h2>
                <p className="text-xs text-slate-500 font-medium mb-6">Updates across the workspace.</p>

                <div className="flex-1 overflow-y-auto pr-2 space-y-5">
                  {activities.length > 0 ? (
                    activities.map((act, index) => (
                      <div key={index} className="flex space-x-3 group">
                        <img src={act.user?.avatar || `https://ui-avatars.com/api/?name=${act.user?.fullName || "U"}`} className="w-8 h-8 rounded-full border border-slate-200 object-cover flex-shrink-0" alt="avatar" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-slate-600 leading-snug">
                            <span className="font-bold text-slate-800">{act.user?.fullName || "User"}</span>
                            <span className="mx-1.5">{act.action}</span>
                            <span className="font-bold text-slate-800 cursor-pointer group-hover:text-[#0b57d0] transition-colors">{act.taskTitle}</span>
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                              {formatDistanceToNow(new Date(act.timestamp), { addSuffix: true })}
                            </span>
                            {act.taskStatus && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500 uppercase tracking-widest border border-slate-200">
                                {act.taskStatus}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3"><svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                      <p className="text-sm font-medium text-slate-400">No recent activity.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ================= TEAM WORKLOAD ================= */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[400px]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="font-bold text-[#1B2559] text-lg tracking-tight">Team workload</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">Monitor the capacity of your team.</p>
                  </div>
                </div>

                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  <span className="w-1/3">Assignee</span>
                  <span className="w-2/3">Work distribution</span>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {workloadData.length === 0 ? (
                     <div className="text-center text-sm font-medium text-slate-400 mt-10">No tasks assigned yet.</div>
                  ) : (
                    workloadData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between group">
                        
                        <div className="w-1/3 flex items-center space-x-2">
                          {item.assigneeName === "Unassigned" ? (
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400 flex-shrink-0">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            </div>
                          ) : (
                            <img src={item.assigneeAvatar || `https://ui-avatars.com/api/?name=${item.assigneeName}`} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                          )}
                          <span className="text-[13px] font-bold text-slate-700 truncate" title={item.assigneeName}>{item.assigneeName}</span>
                        </div>

                        <div className="w-2/3 flex items-center pl-2">
                          <div className="bg-slate-100 h-4 w-full rounded-md overflow-hidden relative border border-slate-200">
                            <div 
                              className={`h-full rounded-md transition-all duration-500 flex items-center justify-end pr-1.5 ${item.percentage > 60 ? 'bg-[#1B2559]' : item.percentage > 30 ? 'bg-[#0b57d0]' : 'bg-blue-400'}`}
                              style={{ width: `${Math.max(item.percentage, 10)}%` }}
                            >
                              {item.percentage > 15 && <span className="text-[9px] font-bold text-white">{item.percentage}%</span>}
                            </div>
                            
                            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[11px] font-semibold py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                              {item.count} tasks assigned
                            </div>
                          </div>
                          {item.percentage <= 15 && <span className="text-[10px] font-bold text-slate-500 ml-2">{item.percentage}%</span>}
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
    </div>
  );
}