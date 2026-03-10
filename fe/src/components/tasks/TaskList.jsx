// fe/src/components/tasks/TaskList.jsx
import { formatDistanceToNow } from 'date-fns';

export default function TaskList({ tasks, onOpenTask, onRefresh }) {
  // Hàm format giây thành HH : MM : SS
  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${h} : ${m} : ${s}`;
  };

  // Chỉ lấy các task cha (không phải subtask)
  const parentTasks = tasks.filter(t => !t.parentTask);

  if (parentTasks.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500 font-medium">
        No tasks found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {parentTasks.map((task) => (
        <div
          key={task._id}
          onClick={() => onOpenTask(task)}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >

          {/* LEFT SIDE */}
          <div className="flex items-start space-x-4 max-w-[50%]">

            {/* Icon */}
            <div className="mt-1 text-slate-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z">
                </path>
              </svg>
            </div>

            <div>

              {/* TITLE */}
              <h3 className="font-bold text-[16px] text-slate-800 mb-1 group-hover:text-blue-600 transition truncate">
                {task.title}
              </h3>

              {/* PROJECT NAME */}
              {task.project && (
                <div className="text-[11px] font-bold text-blue-600 bg-blue-50/80 inline-block px-2 py-0.5 rounded-md mb-1.5 uppercase tracking-wide">
                  {task.project.name}
                </div>
              )}

              {/* META */}
              <div className="flex items-center text-xs text-slate-500 space-x-2 font-medium">

                <span>#{task._id.slice(-6).toUpperCase()}</span>
                <span>•</span>

                <span>
                  Opened {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })} by
                  <strong className="text-slate-700">
                    {" "}{task.owner?.fullName || "User"}
                  </strong>
                </span>

                {/* STATUS */}
                <span className={`px-2 py-0.5 ml-2 rounded-full font-bold ${
                  task.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-600'
                    : task.status === 'Backlog'
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-blue-50 text-blue-600'
                }`}>
                  {task.status}
                </span>

                {/* PRIORITY */}
                <span className={`px-2 py-0.5 rounded-full font-bold ${
                  task.priority === 'high'
                    ? 'bg-red-50 text-red-500'
                    : task.priority === 'low'
                    ? 'bg-emerald-50 text-emerald-500'
                    : 'bg-orange-50 text-orange-500'
                }`}>
                  {task.priority}
                </span>

              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center space-x-6">

            {/* TIMER */}
            <div className="flex items-center bg-emerald-50/50 border border-emerald-100 text-emerald-600 px-3 py-1.5 rounded-full text-sm font-bold">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
                </path>
              </svg>
              {formatTime(task.timeSpent || 0)}
            </div>

            {/* AVATAR */}
            <img
              className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
              src={
                task.assignee?.avatar ||
                `https://ui-avatars.com/api/?name=${task.assignee?.fullName || 'U'}`
              }
              alt="Assignee"
              title={task.assignee?.fullName || "Unassigned"}
            />

            {/* SUBTASK COUNT */}
            <div className="flex items-center text-slate-500 font-semibold text-sm">
              <span className="mr-1">{tasks.filter(t => t.parentTask === task._id).length}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16">
                </path>
              </svg>
            </div>

            {/* COMMENTS */}
            <div className="flex items-center text-slate-400 hover:text-blue-500 transition">
              <span className="mr-1 text-sm font-semibold">
                {task.comments?.length || 0}
              </span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z">
                </path>
              </svg>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}