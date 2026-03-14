// fe/src/pages/Performance.jsx
import { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { getPerformanceDataApi } from "../api/taskApi"; // Import API

export default function Performance() {
  const [performanceData, setPerformanceData] = useState([]);
  const [workLogData, setWorkLogData] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await getPerformanceDataApi();
        setPerformanceData(res.data.performanceData);
        setWorkLogData(res.data.workLogData);
        setRecentTasks(res.data.recentTasks);
      } catch (error) {
        console.error("Lỗi tải Performance Data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  const CustomLineTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-xl border border-slate-100 text-sm">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF7A68]"></div>
            <span className="font-bold text-slate-700">{payload[0].value} Tasks (Achieved)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#6B46C1]"></div>
            <span className="font-bold text-slate-700">{payload[1].value} Tasks (Target)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#f4f7fe] min-h-screen font-sans flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold text-slate-800 mb-6 text-[#1B2559]">Performance Report</h1>

          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-slate-500 font-medium">Calculating performance...</div>
          ) : (
            <>
              {/* === HÀNG 1: 2 BIỂU ĐỒ === */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                
                {/* Biểu đồ Đường (Bên trái) */}
                <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col min-h-[350px]">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Performance Over 6 Months</h2>
                    <div className="flex space-x-6 text-xs font-semibold text-slate-500">
                      <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-[#FF7A68] mr-2"></div>Achieved</div>
                      <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-[#6B46C1] mr-2"></div>Target</div>
                    </div>
                  </div>

                  <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Tooltip content={<CustomLineTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }} />
                        <Line type="monotone" dataKey="achieved" stroke="#FF7A68" strokeWidth={3} dot={{ r: 4, fill: '#FF7A68', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="target" stroke="#6B46C1" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Biểu đồ Tròn (Bên phải) */}
                <div className="lg:col-span-5 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col min-h-[350px]">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[#1B2559]">Work Log</h2>
                    <select className="bg-teal-50 text-teal-600 border-none rounded-lg px-3 py-1.5 text-xs font-bold outline-none cursor-pointer">
                      <option>All Time</option>
                    </select>
                  </div>

                  {workLogData.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">No timer data available.</div>
                  ) : (
                    <div className="flex-1 flex flex-col xl:flex-row items-center justify-between">
                      {/* Biểu đồ Donut bên trái */}
                      <div className="w-full xl:w-1/2 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={workLogData} innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                              {workLogData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} hrs`, "Time Logged"]} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Chú thích (Legend) dạng Grid bên phải */}
                      <div className="w-full xl:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2 xl:pl-4 mt-4 xl:mt-0">
                        {workLogData.map((item, idx) => (
                          <div key={idx} className="flex items-center text-xs font-bold text-slate-600" title={`${item.name} (${item.value} hrs)`}>
                            <div className="w-2 h-2 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                            <span className="truncate">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* === HÀNG 2: DANH SÁCH TASK === */}
              <div className="space-y-4 mb-8">
                <h2 className="text-lg font-bold text-[#1B2559] mb-4">Needs Attention ({recentTasks.length})</h2>
                {recentTasks.length === 0 ? (
                  <div className="text-slate-400 italic text-sm">
                    No tasks are behind schedule or require attention.
                  </div>
                ) : (
                  recentTasks.map((task, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center justify-between transition hover:shadow-md">
                      <div className="flex items-start space-x-4">
                        <div className="mt-1 text-orange-400">
                          {/* Đổi icon thành cái bóng đèn cảnh báo */}
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <div>
                          <h3 className="font-extrabold text-[#1B2559] text-sm mb-1">{task.title}</h3>
                          <p className="text-xs font-semibold text-slate-500">
                            #{task.id} Opened <span className="text-red-500 font-bold">{task.daysAgo} days ago</span> by <span className="text-slate-800">{task.author}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <img src={task.avatar} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" title={task.author} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}