// be/controllers/task.controller.js
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Activity from "../models/Activity.js"; // BỔ SUNG MODEL NÀY
import { logActivity } from "../utils/logger.js";

// Tạo task mới
export const createTask = async (req, res) => {
  try {
    const { title, projectId, assignee, status, priority, startDate, endDate, timeSpent, parentTask } = req.body;
    const creator = req.user.id;

    const newTask = new Task({
      title, project: projectId, creator, assignee, status, priority, startDate, endDate, timeSpent, parentTask
    });

    await newTask.save();
    
    // === GHI LOG: TẠO TASK ===
    await logActivity(creator, "created task", title);
    
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách task của một project
export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ project: projectId })
      .populate("creator", "fullName avatar")
      .populate("assignee", "fullName avatar")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa Task (Có thể xóa nhiều task cùng lúc)
export const deleteTask = async (req, res) => {
  try {
    const taskIds = req.body.ids; 
    
    if (!taskIds || !Array.isArray(taskIds)) {
       return res.status(400).json({ message: "Invalid task IDs provided."});
    }

    // === GHI LOG: TRƯỚC KHI XÓA PHẢI LẤY TÊN TASK ĐỂ GHI LOG ===
    const tasksToDelete = await Task.find({ _id: { $in: taskIds } });
    for (const task of tasksToDelete) {
      await logActivity(req.user.id, "deleted task", task.title);
    }

    const result = await Task.deleteMany({ _id: { $in: taskIds } });
    res.status(200).json({ message: "Task(s) successfully deleted", deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật Task
export const updateTask = async (req, res) => {
  try {
    const taskId = req.params.taskId || req.params.id; 
    const updates = req.body;
    
    if (!taskId) return res.status(400).json({ message: "Task ID is required" });

    // Lấy task cũ để so sánh xem user đã thay đổi cái gì
    const oldTask = await Task.findById(taskId);

    const updatedTask = await Task.findByIdAndUpdate(taskId, updates, { new: true });
    
    // === GHI LOG THÔNG MINH: CHỈ GHI NHỮNG GÌ BỊ THAY ĐỔI ===
    if (updates.status && updates.status !== oldTask.status) {
      await logActivity(req.user.id, `moved to ${updates.status}`, updatedTask.title);
    }
    if (updates.priority && updates.priority !== oldTask.priority) {
      await logActivity(req.user.id, `changed priority to ${updates.priority} on`, updatedTask.title);
    }

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả task của user (Global Tasks)
export const getGlobalTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const myProjects = await Project.find({ $or: [{ owner: userId }, { members: userId }] }).select('_id');
    const projectIds = myProjects.map(p => p._id);

    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate("project", "name") 
      .populate("creator", "fullName avatar")
      .populate("assignee", "fullName avatar")
      .populate("comments.user", "fullName avatar")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bình luận Task
export const addTaskComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text) return res.status(400).json({ message: "Comment text is required" });

    const task = await Task.findByIdAndUpdate(
      id,
      { $push: { comments: { user: userId, text } } },
      { new: true }
    ).populate("comments.user", "fullName avatar");

    // === GHI LOG: BÌNH LUẬN ===
    await logActivity(userId, "commented on task", task.title);

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Hẹn giờ Timer
export const toggleTaskTimer = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    
    if (!task) return res.status(404).json({ message: "Task not found" });

    let updateData = {};
    if (task.isRunning) {
      const startedAt = task.timerStartedAt ? new Date(task.timerStartedAt).getTime() : Date.now();
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      updateData = {
        isRunning: false,
        timerStartedAt: null,
        timeSpent: (task.timeSpent || 0) + Math.max(0, elapsedSeconds) 
      };
      // === GHI LOG: DỪNG TIMER ===
      await logActivity(req.user.id, "stopped tracking time on", task.title);
    } else {
      updateData = { isRunning: true, timerStartedAt: new Date() };
      // === GHI LOG: CHẠY TIMER ===
      await logActivity(req.user.id, "started tracking time on", task.title);
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// === HÀM GET RECENT ACTIVITIES (ĐÃ ĐƯỢC VIẾT LẠI HOÀN TOÀN CHUẨN XÁC) ===
export const getRecentActivities = async (req, res) => {
  try {
    // Truy vấn thẳng vào bảng Activity Log
    const activities = await Activity.find({ user: req.user.id })
      .sort({ createdAt: -1 }) // Lấy mới nhất
      .limit(15) // Giới hạn 15 hành động
      .populate('user', 'fullName avatar');

    // Format lại dữ liệu cho giống với lúc trước Frontend gọi
    const formattedActivities = activities.map(act => ({
      _id: act._id,
      user: act.user,
      action: act.action,
      taskTitle: act.targetName,
      timestamp: act.createdAt
    }));

    res.json(formattedActivities);
  } catch (error) {
    console.error("Lỗi lấy activities:", error);
    res.status(500).json({ message: error.message });
  }
};

// Dashboard - Statistics
export const getTaskStatistics = async (req, res) => {
   // ... Giữ nguyên như cũ của bạn
  try {
    const userId = req.user.id;
    const myProjects = await Project.find({ $or: [{ owner: userId }, { members: userId }] }).select('_id');
    const projectIds = myProjects.map(p => p._id);
    const tasks = await Task.find({ project: { $in: projectIds } });

    const statusCount = { "To Do": 0, "In Progress": 0, "In Review": 0, "Done": 0 };
    const priorityCount = { "high": 0, "medium": 0, "low": 0 };

    tasks.forEach(task => {
      if (statusCount[task.status] !== undefined) statusCount[task.status]++;
      if (priorityCount[task.priority] !== undefined) priorityCount[task.priority]++;
    });

    res.json({
      statusStats: [
        { name: "Done", value: statusCount["Done"], color: "#36b37e" },
        { name: "In Progress", value: statusCount["In Progress"], color: "#0052cc" },
        { name: "In Review", value: statusCount["In Review"], color: "#ffab00" },
        { name: "To Do", value: statusCount["To Do"], color: "#42526e" }
      ],
      priorityStats: [
        { name: "High", value: priorityCount["high"], color: "#ff5630" },
        { name: "Medium", value: priorityCount["medium"], color: "#ffab00" },
        { name: "Low", value: priorityCount["low"], color: "#36b37e" }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// WorkLogs
export const getWorkLogs = async (req, res) => {
  // ... Giữ nguyên như cũ của bạn
  try {
    const userId = req.user.id;
    const myProjects = await Project.find({ $or: [{ owner: userId }, { members: userId }] }).select('_id');
    const projectIds = myProjects.map(p => p._id);
    const tasksWithTime = await Task.find({ project: { $in: projectIds }, timeSpent: { $gt: 0 } }).sort({ updatedAt: -1 });

    const totalSeconds = tasksWithTime.reduce((sum, task) => sum + task.timeSpent, 0);
    const recentLogs = tasksWithTime.slice(0, 10).map(task => {
      const dateStr = new Date(task.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      return {
        id: task._id,
        taskInfo: `${dateStr}||${task.title}`,
        timeValue: parseFloat((task.timeSpent / 3600).toFixed(2)) 
      };
    });

    res.json({ totalSeconds, workLogData: recentLogs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};