// fe/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip
} from "recharts";
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
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 p-8 overflow-y-auto">

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">
              Get a snapshot of the status of your work items.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-slate-500 font-medium">
              Đang tải dữ liệu...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* ================= STATUS OVERVIEW ================= */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                <h2 className="font-bold text-slate-800 text-lg">Status overview</h2>
                <p className="text-xs text-slate-500 mb-6">
                  Get a snapshot of the status of your work items.
                </p>

                <div className="flex-1 relative min-h-[250px] flex items-center">

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 pr-[120px]">
                    <span className="text-3xl font-bold text-slate-800">
                      {totalTasks}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      Total items
                    </span>
                  </div>

                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>

                      <PieTooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                        }}
                      />

                      <Legend
                        verticalAlign="middle"
                        align="right"
                        layout="vertical"
                        iconType="square"
                        wrapperStyle={{
                          fontSize: "13px",
                          color: "#64748b",
                          paddingLeft: "20px"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ================= PRIORITY BREAKDOWN ================= */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                <h2 className="font-bold text-slate-800 text-lg">Priority breakdown</h2>
                <p className="text-xs text-slate-500 mb-6">
                  Get a holistic view of how work is being prioritized.
                </p>

                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={priorityData}
                      margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />

                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 13, fill: "#64748b", fontWeight: 500 }}
                        dy={10}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 13, fill: "#64748b" }}
                      />

                      <BarTooltip
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                        }}
                      />

                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                        {priorityData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ================= RECENT ACTIVITY ================= */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-[400px]">
                <h2 className="font-bold text-slate-800 text-lg">Recent activity</h2>
                <p className="text-xs text-slate-500 mb-6">
                  Stay up to date with what's happening across the workspace.
                </p>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6">

                  {activities.length > 0 ? (
                    activities.map((act, index) => (
                      <div key={index} className="flex space-x-3">

                        <img
                          src={
                            act.user?.avatar ||
                            `https://ui-avatars.com/api/?name=${act.user?.fullName || "U"}`
                          }
                          className="w-8 h-8 rounded-full border border-slate-200 mt-1 object-cover flex-shrink-0"
                          alt="avatar"
                        />

                        <div>
                          <p className="text-[13px] text-slate-600 leading-relaxed">
                            <span className="font-semibold text-blue-600">
                              {act.user?.fullName || "User"}
                            </span>

                            <span className="mx-1">{act.action}</span>

                            <span className="font-medium text-blue-600 hover:underline cursor-pointer">
                              {act.taskTitle}
                            </span>

                            <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                              {act.taskStatus}
                            </span>
                          </p>

                          <p className="text-[11px] text-slate-400 mt-1">
                            {formatDistanceToNow(new Date(act.timestamp), {
                              addSuffix: true
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-400 text-sm mt-10">
                      Chưa có hoạt động nào gần đây.
                    </div>
                  )}

                </div>
              </div>

              {/* ================= TEAM WORKLOAD ================= */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-[400px]">
                <h2 className="font-bold text-slate-800 text-lg mb-2">Team Workload</h2>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-[400px]">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="font-bold text-slate-800 text-lg">Team workload</h2>
                    <p className="text-xs text-slate-500 mt-1">Monitor the capacity of your team.</p>
                  </div>
                </div>

                {/* Table Header */}
                <div className="flex justify-between text-[11px] font-bold text-slate-500 mt-6 mb-3">
                  <span className="w-1/3">Assignee</span>
                  <span className="w-2/3">Work distribution</span>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {workloadData.length === 0 ? (
                     <div className="text-center text-slate-400 text-sm mt-10">No tasks assigned yet.</div>
                  ) : (
                    workloadData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between group">
                        
                        {/* Cột Assignee */}
                        <div className="w-1/3 flex items-center space-x-2">
                          {item.assigneeName === "Unassigned" ? (
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400 flex-shrink-0">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            </div>
                          ) : (
                            <img 
                              src={item.assigneeAvatar || `https://ui-avatars.com/api/?name=${item.assigneeName}`} 
                              alt="Avatar" 
                              className="w-6 h-6 rounded-full object-cover border border-slate-200 flex-shrink-0"
                            />
                          )}
                          <span className="text-sm font-semibold text-slate-700 truncate" title={item.assigneeName}>
                            {item.assigneeName}
                          </span>
                        </div>

                        {/* Cột Progress Bar màu xám Jira */}
                        <div className="w-2/3 flex items-center pl-2">
                          <div 
                            className="bg-[#8993a4] h-5 rounded-sm flex items-center px-2 min-w-[30px] transition-all relative group cursor-default"
                            style={{ width: `${item.percentage}%` }}
                          >
                            <span className="text-[10px] font-bold text-white leading-none whitespace-nowrap overflow-hidden">
                              {item.percentage}%
                            </span>
                            
                            {/* Tooltip khi hover vào thanh màu xám */}
                            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[11px] font-semibold py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                              {item.percentage}% ({item.count} work items)
                            </div>
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}