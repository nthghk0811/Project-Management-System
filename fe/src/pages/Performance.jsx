import { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getPerformanceDataApi } from "../api/taskApi"; 

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
        <div className="bg-white p-3 rounded-lg shadow-md border border-slate-200 text-sm">
          <div className="flex items-center space-x-2 mb-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#0b57d0]"></div>
            <span className="font-bold text-slate-700">{payload[0].value} Tasks (Achieved)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#94a3b8]"></div>
            <span className="font-bold text-slate-700">{payload[1].value} Tasks (Target)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#1B2559] tracking-tight">Performance</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Measure your team's execution and time allocation.</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B2559]"></div>
            </div>
          ) : (
            <>
              {/* === HÀNG 1: 2 BIỂU ĐỒ === */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                
                {/* Biểu đồ Đường (Bên trái) */}
                <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-6 flex flex-col min-h-[380px]">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-[#1B2559] tracking-tight">Delivery Trend (6 Months)</h2>
                    <div className="flex space-x-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-sm bg-[#0b57d0] mr-2"></div>Achieved</div>
                      <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-sm bg-[#94a3b8] mr-2"></div>Target</div>
                    </div>
                  </div>

                  <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                        <Tooltip content={<CustomLineTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }} />
                        <Line type="monotone" dataKey="achieved" stroke="#0b57d0" strokeWidth={3} dot={{ r: 4, fill: '#0b57d0', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Biểu đồ Tròn (Bên phải) */}
                <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-6 flex flex-col min-h-[380px]">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-[#1B2559] tracking-tight">Time Allocation</h2>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">All Time</span>
                  </div>

                  {workLogData.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center bg-slate-50 border border-slate-100 rounded-lg">
                      <p className="text-sm font-bold text-slate-600">No time logged</p>
                      <p className="text-xs text-slate-400 mt-1">Start timers on tasks to see data.</p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col xl:flex-row items-center justify-between mt-2">
                      <div className="w-full xl:w-1/2 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={workLogData} innerRadius={55} outerRadius={85} dataKey="value" stroke="none">
                              {workLogData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} Hrs`, "Time Logged"]} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="w-full xl:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2 xl:pl-4 mt-6 xl:mt-0">
                        {workLogData.map((item, idx) => (
                          <div key={idx} className="flex items-center text-xs font-bold text-slate-600" title={`${item.name} (${item.value} hrs)`}>
                            <div className="w-2.5 h-2.5 rounded-sm mr-2 flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                            <span className="truncate">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* === HÀNG 2: DANH SÁCH TASK === */}
              <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#1B2559] tracking-tight">Requires Attention</h2>
                  <span className="bg-rose-100 text-rose-700 py-0.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-wider">{recentTasks.length} Issues</span>
                </div>
                
                <div className="divide-y divide-slate-100">
                  {recentTasks.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm font-medium bg-slate-50">
                      All systems green. No tasks are falling behind.
                    </div>
                  ) : (
                    recentTasks.map((task, index) => (
                      <div key={index} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-start space-x-4">
                          <div className="mt-0.5 text-rose-500 bg-rose-50 p-1.5 rounded-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm hover:text-[#0b57d0] cursor-pointer transition">{task.title}</h3>
                            <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                              #{task.id} • Opened <span className="text-rose-500">{task.daysAgo} days ago</span> by {task.author}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <img src={task.avatar} alt="Avatar" className="w-7 h-7 rounded-md object-cover border border-slate-200" title={task.author} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}