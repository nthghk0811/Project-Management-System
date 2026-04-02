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

    // 📢 BẮN SOCKET: Báo cho phòng Project biết có task mới
    const io = req.app.get("io");
    if (io) {
        io.to(projectId.toString()).emit("task_updated", { action: "create", message: "Task mới đã được tạo" });
    }
    
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
    if (!taskIds || !Array.isArray(taskIds)) return res.status(400).json({ message: "Invalid task IDs provided."});

    const tasksToDelete = await Task.find({ _id: { $in: taskIds } });
    for (const task of tasksToDelete) {
      await logActivity(req.user.id, "deleted task", task.title);
    }
    
    // Gom lấy danh sách các Project bị ảnh hưởng để báo tin
    const projectIds = [...new Set(tasksToDelete.map(t => t.project.toString()))];
    
    const result = await Task.deleteMany({ _id: { $in: taskIds } });

    // 📢 BẮN SOCKET: Báo cho các phòng bị ảnh hưởng
    const io = req.app.get("io");
    if (io) {
        projectIds.forEach(pId => {
            io.to(pId).emit("task_updated", { action: "delete", message: "Task đã bị xóa" });
        });
    }

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

    const oldTask = await Task.findById(taskId);
    const updatedTask = await Task.findByIdAndUpdate(taskId, updates, { new: true });

    // 📢 BẮN SOCKET: Báo task thay đổi (kéo thả, sửa tên)
    const io = req.app.get("io");
    if (io && updatedTask.project) {
        io.to(updatedTask.project.toString()).emit("task_updated", updatedTask);
    }
   
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

    await logActivity(userId, "commented on task", task.title);

    // 📢 BẮN SOCKET: Báo có bình luận mới
    const io = req.app.get("io");
    if (io && task.project) {
        io.to(task.project.toString()).emit("task_updated", { action: "comment" });
    }

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
      await logActivity(req.user.id, "stopped tracking time on", task.title);
    } else {
      updateData = { isRunning: true, timerStartedAt: new Date() };
      await logActivity(req.user.id, "started tracking time on", task.title);
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true });
    
    // Bắn Socket báo timer update
    const io = req.app.get("io");
    if (io && updatedTask.project) {
        io.to(updatedTask.project.toString()).emit("task_updated", updatedTask);
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. LẤY HOẠT ĐỘNG GẦN ĐÂY
// ==========================================
export const getRecentActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === "Admin" || req.user.role === "Leader";

    // Phễu lọc: Admin thì lấy hết activity, User thì lấy của chính họ
    const activityFilter = isAdmin ? {} : { user: userId };

    const activities = await Activity.find(activityFilter)
      .sort({ createdAt: -1 })
      .limit(15) 
      .populate('user', 'fullName avatar');

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

  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    let taskFilter = {};


    if (!isAdmin) {
      const myProjects = await Project.find({
        $or: [{ owner: userId }, { members: userId }]
      }).select('_id');
      const projectIds = myProjects.map(p => p._id);
      taskFilter = { project: { $in: projectIds } };
    }

    // Lấy task dựa trên filter
    const tasks = await Task.find(taskFilter);
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
  try {
    const userId = req.user.id;
    // BẮT CHUẨN QUYỀN ADMIN BẰNG CHỮ THƯỜNG
    const isAdmin = req.user.role?.toLowerCase() === "admin" || req.user.role?.toLowerCase() === "leader";

    let taskFilter = { timeSpent: { $gt: 0 } }; // Chỉ lấy task nào có bấm giờ

    // Nếu KHÔNG phải Admin, mới bị giới hạn trong các dự án của mình
    if (!isAdmin) {
      const myProjects = await Project.find({ $or: [{ owner: userId }, { members: userId }] }).select('_id');
      const projectIds = myProjects.map(p => p._id);
      taskFilter.project = { $in: projectIds };
    }

    // Populate thêm assignee để Sếp biết thằng nào làm
    const tasksWithTime = await Task.find(taskFilter)
      .populate('assignee', 'fullName avatar')
      .sort({ updatedAt: -1 });

    const totalSeconds = tasksWithTime.reduce((sum, task) => sum + task.timeSpent, 0);
    
    // Cắt 15 task gần nhất
    const recentLogs = tasksWithTime.slice(0, 15).map(task => {
      const dateStr = new Date(task.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const assigneeName = task.assignee ? task.assignee.fullName : "Unassigned";
      return {
        id: task._id,
        // Nối thêm Tên người làm vào chuỗi để ném lên Frontend cắt ra
        taskInfo: `${dateStr}||${task.title}||${assigneeName}`,
        timeValue: parseFloat((task.timeSpent / 3600).toFixed(2)) 
      };
    });

    res.json({ totalSeconds, workLogData: recentLogs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//performance

export const getPerformanceData = async (req, res) => {
  try {
    const userId = req.user.id;
    // FIX LỖI "PHÂN QUYỀN": Phải toLowerCase() thì mới bắt được chữ 'admin'
    const isAdmin = req.user.role?.toLowerCase() === "admin" || req.user.role?.toLowerCase() === "leader";

    const now = new Date();

    // TẠO PHỄU LỌC: Admin thì lấy hết ({}), User thì chỉ lấy của mình
    const baseFilter = isAdmin 
      ? {} 
      : { $or: [{ assignee: userId }, { creator: userId }] };

    const performanceData = [];
    for (let i = 5; i >= 0; i--) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthName = startOfMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const achieved = await Task.countDocuments({
        ...baseFilter,
        status: "Done",
        updatedAt: { $gte: startOfMonth, $lt: endOfMonth }
      });

      const assigned = await Task.countDocuments({
        ...baseFilter,
        createdAt: { $gte: startOfMonth, $lt: endOfMonth }
      });
      const target = assigned === 0 ? 5 : assigned;

      performanceData.push({ name: monthName, achieved, target });
    }

    const tasksWithTime = await Task.find({
      ...baseFilter,
      timeSpent: { $gt: 0 }
    }).populate('project', 'name');

    const projectTimeMap = {};
    tasksWithTime.forEach(t => {
      const pName = t.project ? t.project.name : "Deleted Project";
      if (!projectTimeMap[pName]) projectTimeMap[pName] = 0;
      projectTimeMap[pName] += t.timeSpent;
    });

    // MÀU SẮC ĐỒNG BỘ CSS NAVY / BLUE / SLATE THEO VIBE ENTERPRISE
    const colors = ['#1B2559', '#0b57d0', '#64748b', '#3b82f6', '#94a3b8', '#0284c7'];
    const workLogData = Object.keys(projectTimeMap).map((key, index) => ({
      name: key,
      value: parseFloat((projectTimeMap[key] / 3600).toFixed(2)), 
      color: colors[index % colors.length]
    }));

    const insights = await Task.find({
      ...baseFilter,
      status: { $ne: 'Done' }
    })
    .sort({ priority: -1, createdAt: 1 })
    .limit(5)
    .populate('creator', 'fullName avatar');

    const recentTasks = insights.map(t => {
      const daysAgo = Math.floor((now - new Date(t.createdAt)) / (1000 * 60 * 60 * 24));
      return {
        id: t._id.toString().slice(-5).toUpperCase(),
        title: t.title,
        author: t.creator?.fullName || "System",
        avatar: t.creator?.avatar || `https://ui-avatars.com/api/?name=${t.creator?.fullName || 'U'}`,
        daysAgo: daysAgo
      };
    });

    res.json({ performanceData, workLogData, recentTasks });

  } catch (error) {
    console.error("Lỗi lấy Performance Data:", error);
    res.status(500).json({ message: error.message });
  }
};


// ==========================================
// 2. LẤY DỮ LIỆU KHỐI LƯỢNG CÔNG VIỆC NHÓM
// ==========================================
export const getTeamWorkload = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === "Admin" || req.user.role === "Leader";
    
    let tasks = [];

    if (isAdmin) {
      // Admin: Lấy thẳng toàn bộ task trong hệ thống
      tasks = await Task.find({}).populate('assignee', 'fullName avatar');
    } else {
      // User: Lấy các project mình tham gia trước, sau đó lấy task thuộc các project đó
      const myProjects = await Project.find({
        $or: [{ owner: userId }, { members: userId }]
      }).select('_id');
      
      const projectIds = myProjects.map(p => p._id);
      
      tasks = await Task.find({ project: { $in: projectIds } })
        .populate('assignee', 'fullName avatar');
    }

    const totalTasks = tasks.length;
    if (totalTasks === 0) return res.json([]);

    const workloadMap = {};
    let unassignedCount = 0;

    tasks.forEach(task => {
      if (!task.assignee) {
        unassignedCount++;
      } else {
        const id = task.assignee._id.toString();
        if (!workloadMap[id]) {
          workloadMap[id] = { user: task.assignee, count: 0 };
        }
        workloadMap[id].count++;
      }
    });

    const workloadData = Object.values(workloadMap).map(item => ({
      assigneeName: item.user.fullName,
      assigneeAvatar: item.user.avatar,
      count: item.count,
      percentage: Math.round((item.count / totalTasks) * 100)
    }));

    if (unassignedCount > 0) {
      workloadData.push({
        assigneeName: "Unassigned",
        assigneeAvatar: null,
        count: unassignedCount,
        percentage: Math.round((unassignedCount / totalTasks) * 100)
      });
    }

    workloadData.sort((a, b) => b.count - a.count);
    res.json(workloadData);
  } catch (error) {
    console.error("Lỗi lấy Team Workload:", error);
    res.status(500).json({ message: error.message });
  }
};