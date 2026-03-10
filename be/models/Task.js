// be/models/Task.js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    
    // Liên kết
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    
    // Đổi từ creator sang owner theo đúng cấu trúc của bạn
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    // Để làm Subtasks (nếu null thì là task cha, nếu có ID thì là task con của ID đó)
    parentTask: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },

    status: {
      type: String,
      enum: ["To Do", "In Progress", "In Review", "Done"], // Đã thêm Completed theo UI
      default: "To Do",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    
    // Thời gian
    startDate: { type: Date },
    dueDate: { type: Date }, // Dùng thay thế hoặc song song với endDate
    
    // Hệ thống Tracking thời gian (Timer Play/Pause)
    timeSpent: { type: Number, default: 0 }, // LƯU Ý: Đổi sang Number (giây) để dễ cộng trừ, format HH:MM:SS ở Frontend
    isRunning: { type: Boolean, default: false }, // Đang bấm Play hay Pause
    timerStartedAt: { type: Date, default: null }, // Mốc thời gian lúc bấm Play

    // Mảng dữ liệu nhúng (Embedded Documents)
    attachments: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;