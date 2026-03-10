// fe/src/components/tasks/SubtaskList.jsx
import { updateTaskApi, deleteTaskApi } from "../../api/taskApi";

export default function SubtaskList({ subtasks, onRefresh }) {
  
  // Đánh dấu hoàn thành / chưa hoàn thành
  const handleToggle = async (subtask) => {
    // Chuyển đổi qua lại giữa 'Completed' và 'To Do'
    const newStatus = subtask.status === "Completed" ? "To Do" : "Completed";
    
    // Optimistic UI có thể áp dụng ở đây, nhưng để an toàn ta cứ gọi API rồi refresh
    try {
      await updateTaskApi(subtask._id, { status: newStatus });
      onRefresh();
    } catch (error) {
      console.error("Lỗi cập nhật subtask:", error);
      alert("Không thể cập nhật trạng thái.");
    }
  };

  // Xóa subtask
  const handleDelete = async (subtaskId) => {
    if (!window.confirm("Bạn có chắc muốn xóa công việc con này?")) return;
    try {
      await deleteTaskApi([subtaskId]); // API của bạn nhận vào 1 mảng các ID
      onRefresh();
    } catch (error) {
      console.error("Lỗi xóa subtask:", error);
      alert("Không thể xóa công việc con.");
    }
  };

  if (!subtasks || subtasks.length === 0) {
    return <div className="text-sm text-slate-400 italic py-2">Chưa có công việc con nào.</div>;
  }

  return (
    <div className="space-y-2">
      {subtasks.map((st) => (
        <div key={st._id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-blue-200 transition group">
          
          <div className="flex items-center space-x-3 overflow-hidden">
            <input 
              type="checkbox" 
              checked={st.status === "Completed"} 
              onChange={() => handleToggle(st)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
            />
            <span className={`text-sm font-medium truncate ${st.status === "Completed" ? "text-slate-400 line-through" : "text-slate-700"}`}>
              {st.title}
            </span>
          </div>

          <button 
            onClick={() => handleDelete(st._id)}
            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition px-2"
            title="Xóa công việc con"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      ))}
    </div>
  );
}