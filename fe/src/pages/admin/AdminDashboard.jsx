// fe/src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip
} from "recharts";
import { getTaskStatisticsApi, getRecentActivitiesApi, getPerformanceDataApi } from "../../api/taskApi";

export default function AdminDashboard() {
  const [statusData, setStatusData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [performanceData, setPerformanceData] = useState([]); 
  const [workLogData, setWorkLogData] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, activitiesRes, perfRes] = await Promise.all([
        getTaskStatisticsApi(),
        getRecentActivitiesApi(),
        getPerformanceDataApi() 
      ]);

      setStatusData(statsRes.data.statusStats || []);
      setActivities(activitiesRes.data || []);
      if (perfRes.data) {
        setPerformanceData(perfRes.data.performanceData || []);
        setWorkLogData(perfRes.data.workLogData || []);
      }
    } catch (error) {
      console.error("Error fetching Admin Dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-[#f4f7fe] min-h-screen font-sans flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1B2559]">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Global overview of all projects and resources in the system.</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-slate-500 font-medium">Loading system data...</div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              {/* 1. Projects Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col min-h-[350px]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Projects Overview</h2>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">Global Data</span>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-5 flex flex-col justify-center">
                    <p className="text-sm font-semibold text-blue-600 mb-1">Total Active</p>
                    <p className="text-3xl font-extrabold text-blue-700">12</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-5 flex flex-col justify-center">
                    <p className="text-sm font-semibold text-emerald-600 mb-1">Completed</p>
                    <p className="text-3xl font-extrabold text-emerald-700">45</p>
                  </div>
                  <div className="col-span-2 bg-slate-50 rounded-xl p-4 overflow-y-auto max-h-[140px]">
                     <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Activity</h3>
                     {activities.slice(0, 3).map((act, idx) => (
                        <div key={idx} className="flex items-center text-sm mb-2 text-slate-600">
                          <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                          <span className="truncate"><span className="font-semibold text-slate-800">{act.user?.fullName}</span> {act.action} {act.taskTitle}</span>
                        </div>
                     ))}
                  </div>
                </div>
              </div>

              {/* 2. Tasks Pie Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col min-h-[350px]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-800">Tasks Distribution</h2>
                </div>
                <div className="flex-1 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} innerRadius={0} outerRadius={110} dataKey="value" stroke="none">
                        {statusData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <PieTooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                      <Legend verticalAlign="middle" align="right" layout="vertical" iconType="square" wrapperStyle={{ fontSize: "13px", fontWeight: "600", color: "#475569" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 3. Work Log Donut Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col min-h-[350px]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-800">System Work Log</h2>
                </div>
                <div className="flex-1 relative flex items-center justify-center">
                  {workLogData.length === 0 ? (
                    <div className="text-slate-400 text-sm">No log data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={workLogData} innerRadius={60} outerRadius={100} dataKey="value" stroke="none">
                          {workLogData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <PieTooltip formatter={(value) => [`${value} hrs`, "Logged"]} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                        <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: "13px", fontWeight: "600", color: "#475569" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* 4. Performance Line Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col min-h-[350px]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-800">Global Performance</h2>
                  <div className="flex space-x-4 text-xs font-bold text-slate-500">
                    <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-[#FF7A68] mr-1.5"></div>Achieved</div>
                    <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-[#6B46C1] mr-1.5"></div>Target</div>
                  </div>
                </div>
                <div className="flex-1 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <LineTooltip cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }} />
                      <Line type="monotone" dataKey="achieved" stroke="#FF7A68" strokeWidth={3} dot={{ r: 4, fill: '#FF7A68', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="target" stroke="#6B46C1" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}