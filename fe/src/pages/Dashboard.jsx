import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip
} from "recharts";

export default function Dashboard() {
  // Dữ liệu giả lập (Mock data) - Sau này sẽ thay bằng dữ liệu lấy từ API
  const statusData = [
    { name: "Done", value: 5, color: "#65ba43" }, // Xanh lá
    { name: "In Progress", value: 3, color: "#0052cc" }, // Xanh dương
    { name: "In Review", value: 2, color: "#ff991f" }, // Cam
    { name: "To Do", value: 8, color: "#998dd9" }, // Tím
  ];

  const priorityData = [
    { name: "High", value: 3, color: "#ff5630" }, // Đỏ
    { name: "Medium", value: 10, color: "#ffab00" }, // Vàng/Cam
    { name: "Low", value: 5, color: "#36b37e" }, // Xanh lá
  ];

  // Tính tổng số Task cho biểu đồ tròn
  const totalTasks = statusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Get a snapshot of the status of your work items.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* ================= BIỂU ĐỒ 1: STATUS OVERVIEW (DONUT CHART) ================= */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <h2 className="font-bold text-slate-800 text-lg">Status overview</h2>
              <p className="text-xs text-slate-500 mb-6">Get a snapshot of the status of your work items.</p>
              
              <div className="flex-1 relative min-h-[250px] flex items-center">
                {/* Chữ Tổng số nằm ở chính giữa biểu đồ */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 pr-[120px]">
                  <span className="text-3xl font-bold text-slate-800">{totalTasks}</span>
                  <span className="text-xs font-medium text-slate-500">Total items</span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      innerRadius={80} // Tạo khoảng trống ở giữa để thành Donut
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <PieTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend 
                      verticalAlign="middle" 
                      align="right" 
                      layout="vertical"
                      iconType="square"
                      wrapperStyle={{ fontSize: '13px', color: '#64748b', paddingLeft: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ================= BIỂU ĐỒ 2: PRIORITY BREAKDOWN (BAR CHART) ================= */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <h2 className="font-bold text-slate-800 text-lg">Priority breakdown</h2>
              <p className="text-xs text-slate-500 mb-6">Get a holistic view of how work is being prioritized.</p>
              
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 13, fill: '#64748b' }}
                    />
                    <BarTooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Các Row khác giữ chỗ */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-64 flex flex-col">
              <h2 className="font-bold text-slate-800 text-lg mb-2">Recent activity</h2>
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-lg">
                Activity feed coming soon...
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-64 flex flex-col">
              <h2 className="font-bold text-slate-800 text-lg mb-2">Workload</h2>
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-lg">
                Workload chart coming soon...
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}