import { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getWorkLogsApi } from "../api/taskApi"; 

export default function WorkLogs() {
  const [workLogData, setWorkLogData] = useState([]);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkLogs = async () => {
      try {
        const res = await getWorkLogsApi();
        setWorkLogData(res.data.workLogData);
        setTotalSeconds(res.data.totalSeconds);
      } catch (error) {
        console.error("Lỗi khi tải Work Logs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkLogs();
  }, []);

  const formatTotalTime = (seconds) => {
    if (seconds === 0) return "0h 0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const weeks = Math.floor(hours / 40); 
    const days = Math.floor((hours % 40) / 8); 
    const remainingHours = hours % 8;

    let result = [];
    if (weeks > 0) result.push(`${weeks}w`);
    if (days > 0) result.push(`${days}d`);
    if (remainingHours > 0) result.push(`${remainingHours}h`);
    if (minutes > 0 && weeks === 0) result.push(`${minutes}m`); 
    return result.join(" ") || "0m";
  };

  const notifications = [
    { id: 1, name: "System", action: "calculated your work logs", date: "Just now", avatar: "https://ui-avatars.com/api/?name=System&background=0D8ABC&color=fff" },
  ];

  const CustomYAxisTick = ({ x, y, payload }) => {
    if (!payload.value.includes("||")) return null;
    const [date, title, assigneeName] = payload.value.split("||");
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={-450} y={-6} textAnchor="start" fill="#94a3b8" fontSize={11} fontWeight={600} className="uppercase tracking-wider">{date}</text>
        <text x={-360} y={-6} textAnchor="start" fill="#1e293b" fontSize={12} fontWeight={700}>
          {title.length > 40 ? title.substring(0, 40) + "..." : title}
        </text>
        {/* Render Tên thằng nhân viên */}
        <text x={-360} y={12} textAnchor="start" fill="#64748b" fontSize={11} fontWeight={600}>
           👤 {assigneeName || "Unassigned"}
        </text>
      </g>
    );
  };

  const goalSeconds = 144000;
  const remainingSeconds = goalSeconds > totalSeconds ? goalSeconds - totalSeconds : 0;
  const totalWorkData = [
    { name: "Logged Time", value: totalSeconds, color: "#0b57d0" },
    { name: "Remaining", value: remainingSeconds, color: "#f1f5f9" }
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#1B2559] tracking-tight">Timesheet</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Detailed log of hours spent on issues.</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B2559]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* ================= CỘT TRÁI: BIỂU ĐỒ WORKLOG NGANG ================= */}
              <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200/80 p-6 flex flex-col min-h-[500px]">
                <div className="mb-6 pb-4 border-b border-slate-100">
                  <h2 className="text-base font-bold text-[#1B2559] tracking-tight">Recent Work Logs</h2>
                </div>

                {workLogData.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-sm font-bold text-slate-600">No time recorded</p>
                  </div>
                ) : (
                  <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={workLogData} margin={{ top: 10, right: 30, left: 450, bottom: 0 }} barSize={14}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} orientation="bottom" />
                        <YAxis type="category" dataKey="taskInfo" axisLine={false} tickLine={false} tick={<CustomYAxisTick />} />
                       <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                          formatter={(value) => [`${value} Hrs`, "Logged Time"]}
                          // Cắt chuỗi để hiện Tooltip cho gọn
                          labelFormatter={(label) => {
                            const parts = label.split("||");
                            return `${parts[1]} (${parts[2]})`; 
                          }} 
                        />
                        <Bar dataKey="timeValue" fill="#0b57d0" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* ================= CỘT PHẢI ================= */}
              <div className="xl:col-span-4 flex flex-col space-y-6">
                
                {/* Box 1: Total WorkLog */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 flex flex-col items-center">
                  <div className="w-full pb-4 border-b border-slate-100 mb-6">
                    <h2 className="text-base font-bold text-[#1B2559] tracking-tight text-left w-full">Weekly Target</h2>
                  </div>
                  
                  <div className="relative w-48 h-48">
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Logged</span>
                      <span className="text-3xl font-extrabold text-[#1B2559] tracking-tighter">
                        {formatTotalTime(totalSeconds)}
                      </span>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={totalWorkData} innerRadius={70} outerRadius={85} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                          {totalWorkData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Box 2: Notifications */}
                <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden flex-1 flex flex-col">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-base font-bold text-[#1B2559] tracking-tight">System Events</h2>
                    <span className="text-[10px] font-bold text-slate-400 uppercase cursor-pointer hover:text-[#0b57d0]">Clear</span>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {notifications.map((noti) => (
                      <div key={noti.id} className="p-5 flex items-start space-x-4 hover:bg-slate-50 transition-colors">
                        <img src={noti.avatar} alt="avatar" className="w-8 h-8 rounded-md object-cover border border-slate-200" />
                        <div>
                          <p className="text-xs text-slate-600 leading-snug">
                            <span className="font-bold text-slate-800 mr-1">{noti.name}</span>
                            {noti.action}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{noti.date}</p>
                        </div>
                      </div>
                    ))}
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