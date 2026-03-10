// fe/src/pages/WorkLogs.jsx
import { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { getWorkLogsApi } from "../api/taskApi"; // Import API

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

  // Hàm chuyển đổi Tổng Số Giây thành chuỗi (VD: 5w 2d 3h)
  // Quy chuẩn: 1 giờ = 3600s, 1 ngày = 8 giờ, 1 tuần = 5 ngày
  const formatTotalTime = (seconds) => {
    if (seconds === 0) return "0h 0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const weeks = Math.floor(hours / 40); // 40h/tuần
    const days = Math.floor((hours % 40) / 8); // 8h/ngày
    const remainingHours = hours % 8;

    let result = [];
    if (weeks > 0) result.push(`${weeks}w`);
    if (days > 0) result.push(`${days}d`);
    if (remainingHours > 0) result.push(`${remainingHours}h`);
    if (minutes > 0 && weeks === 0) result.push(`${minutes}m`); // Chỉ hiện phút nếu chưa tới 1 tuần cho đỡ dài

    return result.join(" ") || "0m";
  };

  // MOCK DATA: Notifications (Vì ta chưa có bảng Notification thực trong DB)
  const notifications = [
    { id: 1, name: "System", action: "calculated your work logs", date: "Just now", avatar: "https://ui-avatars.com/api/?name=System&background=0D8ABC&color=fff" },
  ];

  // Custom UI cho Trục Y của biểu đồ (Ngày + Tên Task)
  const CustomYAxisTick = ({ x, y, payload }) => {
    if (!payload.value.includes("||")) return null;
    const [date, title] = payload.value.split("||");
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={-450} y={0} dy={4} textAnchor="start" fill="#64748b" fontSize={12} fontWeight={500}>{date}</text>
        <text x={-360} y={0} dy={4} textAnchor="start" fill="#0f172a" fontSize={13} fontWeight={700}>
          {title.length > 50 ? title.substring(0, 50) + "..." : title}
        </text>
      </g>
    );
  };

  // Data cho biểu đồ tròn (Giả sử mục tiêu 1 tuần là 40h = 144000s)
  const goalSeconds = 144000;
  const remainingSeconds = goalSeconds > totalSeconds ? goalSeconds - totalSeconds : 0;
  const totalWorkData = [
    { name: "Logged Time", value: totalSeconds, color: "#0ea5e9" },
    { name: "Remaining", value: remainingSeconds, color: "#cbd5e1" }
  ];

  return (
    <div className="bg-[#f4f7fe] min-h-screen font-sans flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-slate-500">Đang tính toán nhật ký công việc...</div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
              
              {/* ================= CỘT TRÁI: BIỂU ĐỒ WORKLOG NGANG ================= */}
              <div className="xl:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col min-h-[600px]">
                {workLogData.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-slate-400">
                    Chưa có công việc nào được ghi nhận thời gian. Hãy bấm Play Timer ở một Task bất kỳ nhé!
                  </div>
                ) : (
                  <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={workLogData} margin={{ top: 20, right: 30, left: 450, bottom: 20 }} barSize={12}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} orientation="bottom" />
                        <YAxis type="category" dataKey="taskInfo" axisLine={false} tickLine={false} tick={<CustomYAxisTick />} />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value) => [`${value} Hrs`, "Logged Time"]}
                          labelFormatter={(label) => label.split("||")[1]} 
                        />
                        <Bar dataKey="timeValue" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* ================= CỘT PHẢI: THỐNG KÊ & THÔNG BÁO ================= */}
              <div className="xl:col-span-4 flex flex-col space-y-6">
                
                {/* Box 1: Total WorkLog (Donut Chart) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center relative">
                  <div className="w-full flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 text-lg">Total WorkLog</h3>
                  </div>
                  
                  <div className="relative w-48 h-48">
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                      <span className="text-xs text-slate-500 font-medium mb-1">Statistics</span>
                      <span className="text-2xl font-extrabold text-slate-800 text-center">
                        {formatTotalTime(totalSeconds)}
                      </span>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={totalWorkData} innerRadius={70} outerRadius={85} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                          {totalWorkData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Box 2: Notifications */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 text-lg">Notifications</h3>
                    <button className="text-sm font-semibold text-slate-500 hover:text-blue-600">view all</button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-5 pr-2">
                    {notifications.map((noti) => (
                      <div key={noti.id} className="flex items-start space-x-4">
                        <img src={noti.avatar} alt="avatar" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="text-sm text-slate-600 leading-snug">
                            <span className="font-bold text-slate-800 mr-1">{noti.name}</span>
                            {noti.action}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium mt-1">{noti.date}</p>
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