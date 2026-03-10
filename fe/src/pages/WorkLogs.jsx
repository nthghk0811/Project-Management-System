import { useState } from "react";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

export default function WorkLogs() {
  // 1. MOCK DATA: Lịch sử làm việc (Sẽ dùng data từ Timer sau này)
  // Gộp Ngày và Tên task lại bằng ký tự "||" để dễ tách ra khi vẽ biểu đồ
  const workLogData = [
    { id: "1", taskInfo: "05 Nov 2022||Make an Automatic Payment System that enable the design", timeValue: 85 },
    { id: "2", taskInfo: "05 Nov 2022||Create Database schema for user authentication", timeValue: 60 },
    { id: "3", taskInfo: "04 Nov 2022||Fix drag and drop bug on Kanban Board", timeValue: 90 },
    { id: "4", taskInfo: "03 Nov 2022||Design wireframe for Dashboard analytics", timeValue: 45 },
    { id: "5", taskInfo: "02 Nov 2022||Setup CI/CD pipeline using GitHub Actions", timeValue: 70 },
  ];

  // 2. MOCK DATA: Tổng thời gian (Donut Chart)
  const totalWorkData = [
    { name: "Logged Time", value: 75, color: "#0ea5e9" }, // Màu xanh dương
    { name: "Remaining", value: 25, color: "#cbd5e1" }    // Màu xám (phần trống)
  ];

  // 3. MOCK DATA: Notifications
  const notifications = [
    { id: 1, name: "Ellie", action: "joined team developers", date: "04 April, 2024 | 04:00 PM", avatar: "https://ui-avatars.com/api/?name=Ellie&background=random" },
    { id: 2, name: "Jenny", action: "joined team HR", date: "04 April, 2024 | 04:00 PM", avatar: "https://ui-avatars.com/api/?name=Jenny&background=random" },
    { id: 3, name: "Adam", action: "got employee of the month", date: "03 April, 2024 | 02:00 PM", avatar: "https://ui-avatars.com/api/?name=Adam&background=random" },
    { id: 4, name: "Robert", action: "joined team design", date: "02 April, 2024 | 02:00 PM", avatar: "https://ui-avatars.com/api/?name=Robert&background=random" },
    { id: 5, name: "Jack", action: "updated Kanban board", date: "01 April, 2024 | 03:00 PM", avatar: "https://ui-avatars.com/api/?name=Jack&background=random" },
  ];

  // CUSTOM UI: Hàm vẽ chữ ở Trục Y (Hiển thị Ngày bên trái, Tên Task bên phải)
  const CustomYAxisTick = ({ x, y, payload }) => {
    const [date, title] = payload.value.split("||");
    return (
      <g transform={`translate(${x},${y})`}>
        {/* Ngày tháng */}
        <text x={-450} y={0} dy={4} textAnchor="start" fill="#64748b" fontSize={12} fontWeight={500}>
          {date}
        </text>
        {/* Tên Task */}
        <text x={-360} y={0} dy={4} textAnchor="start" fill="#0f172a" fontSize={13} fontWeight={700}>
          {title.length > 50 ? title.substring(0, 50) + "..." : title}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-[#f4f7fe] min-h-screen font-sans flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {/* Main Grid: Cột trái chiếm 2/3 (hoặc 8 phần), Cột phải chiếm 1/3 (4 phần) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
            
            {/* ================= CỘT TRÁI: BIỂU ĐỒ WORKLOG NGANG ================= */}
            <div className="xl:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col min-h-[600px]">
              <h2 className="text-xl font-bold text-slate-800 mb-8 hidden">Biểu đồ ẩn (nếu cần thiết kế giống hệt ảnh)</h2>
              
              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={workLogData}
                    margin={{ top: 20, right: 30, left: 450, bottom: 20 }} // Left margin cực lớn để chứa text
                    barSize={12} // Độ dày của thanh bar
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis 
                      type="number" 
                      domain={[0, 100]} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      orientation="bottom"
                    />
                    <YAxis 
                      type="category" 
                      dataKey="taskInfo" 
                      axisLine={false} 
                      tickLine={false}
                      tick={<CustomYAxisTick />} // Sử dụng UI Custom
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`${value} Hrs`, "Logged Time"]}
                      labelFormatter={(label) => label.split("||")[1]} // Chỉ hiện tên task trong tooltip
                    />
                    {/* Màu thanh bar có thể đổi gradient, tạm thời dùng màu xanh nhạt */}
                    <Bar dataKey="timeValue" fill="#f1f5f9" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ================= CỘT PHẢI: THỐNG KÊ & THÔNG BÁO ================= */}
            <div className="xl:col-span-4 flex flex-col space-y-6">
              
              {/* Box 1: Total WorkLog (Donut Chart) */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center relative">
                <div className="w-full flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 text-lg">Total WorkLog</h3>
                  <button className="text-slate-400 hover:text-slate-800"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg></button>
                </div>
                
                <div className="relative w-48 h-48">
                  {/* Chữ ở giữa Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                    <span className="text-xs text-slate-500 font-medium mb-1">Statistics</span>
                    <span className="text-2xl font-extrabold text-slate-800">5w: 2d</span>
                  </div>

                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={totalWorkData}
                        innerRadius={70}
                        outerRadius={85}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                      >
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
        </div>
      </div>
    </div>
  );
}