// fe/src/pages/admin/AdminApproval.jsx
import { useState } from "react";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";

export default function AdminApproval() {
  // Dữ liệu tấu hài (Fake Data) để test UI
  const [requests, setRequests] = useState([
    { id: 1, user: "Nguyễn Văn Culi", avatar: "https://i.pravatar.cc/150?u=1", type: "JOIN", project: "Website Bán Lẻ", time: "10 mins ago", note: "Sếp ơi cho em vào dự án kiếm cơm với ạ 😭" },
    { id: 2, user: "Trần Thị Tester", avatar: "https://i.pravatar.cc/150?u=2", type: "LEAVE", project: "App Đa Cấp", time: "2 hours ago", note: "Dự án nát quá rồi, sếp tha cho em đi..." },
    { id: 3, user: "Lê Văn Dev", avatar: "https://i.pravatar.cc/150?u=3", type: "LOGIN", project: "Hệ thống", time: "1 day ago", note: "Em người mới, mong sếp duyệt acc cho em vào cống hiến!" },
  ]);

  const handleApprove = (id, user) => {
    alert(`Đã ban ân huệ cho tên bần nông ${user}!`);
    setRequests(requests.filter(req => req.id !== id));
  };

  const handleReject = (id, user) => {
    alert(`Đã tiễn ${user} ra chuồng gà! Cút!`);
    setRequests(requests.filter(req => req.id !== id));
  };

  return (
    <div className="bg-[#f4f7fe] min-h-screen font-sans flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 p-8 overflow-y-auto">
          
          {/* HEADER TẤU HÀI */}
          <div className="mb-8 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">Ngai Vàng Của Sếp 👑</h1>
              <p className="text-slate-300 text-sm">
                Chào mừng ngài trở lại. Hôm nay có <span className="font-bold text-yellow-400 text-lg">{requests.length}</span> thần dân đang dập đầu chờ ngài ban phát ân huệ.
              </p>
            </div>
            {/* Họa tiết mờ ảo trang trí */}
            <svg className="absolute right-0 top-0 h-full text-white opacity-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>

          {/* BẢNG YÊU CẦU */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Sớ Tấu Lên Triều (Pending Requests)</h2>
              <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition">Duyệt tất cả cho nhanh nghỉ</button>
            </div>

            <div className="overflow-x-auto">
              {requests.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🕊️</div>
                  <h3 className="text-lg font-bold text-slate-700">Thiên hạ thái bình!</h3>
                  <p className="text-slate-500 mt-1">Không có con nhang đệ tử nào làm phiền sếp lúc này.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4">Kẻ Cầu Xin</th>
                      <th className="px-6 py-4">Loại Sớ</th>
                      <th className="px-6 py-4">Nội Dung / Lý Do</th>
                      <th className="px-6 py-4 text-right">Phán Quyết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 transition group">
                        
                        {/* Cột 1: Thông tin kẻ hầu */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <img src={req.avatar} alt="avatar" className="w-10 h-10 rounded-full border border-slate-200" />
                            <div>
                              <p className="text-sm font-bold text-slate-800">{req.user}</p>
                              <p className="text-xs text-slate-400">{req.time}</p>
                            </div>
                          </div>
                        </td>

                        {/* Cột 2: Loại Sớ */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                            ${req.type === 'JOIN' ? 'bg-blue-100 text-blue-700' : 
                              req.type === 'LEAVE' ? 'bg-red-100 text-red-700' : 
                              'bg-emerald-100 text-emerald-700'}`}
                          >
                            {req.type === 'JOIN' ? 'Xin Vào Project' : req.type === 'LEAVE' ? 'Xin Chuồn' : 'Xin Cấp Acc'}
                          </span>
                        </td>

                        {/* Cột 3: Lý do bần hèn */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-700">{req.project}</p>
                          <p className="text-xs text-slate-500 italic mt-0.5">"{req.note}"</p>
                        </td>

                        {/* Cột 4: Quyền Lực */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleReject(req.id, req.user)}
                              className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-bold transition"
                              title="Cút!"
                            >
                              Trảm 🪓
                            </button>
                            <button 
                              onClick={() => handleApprove(req.id, req.user)}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg text-xs font-bold shadow-sm transition"
                              title="Cho qua"
                            >
                              Duyệt 👍
                            </button>
                          </div>
                          {/* Nút giả lập lúc chưa hover */}
                          <div className="text-xs text-slate-300 font-medium group-hover:hidden">Đang chờ sếp...</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}