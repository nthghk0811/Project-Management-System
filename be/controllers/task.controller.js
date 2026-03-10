// be/controllers/task.controller.js
import Task from "../models/Task.js";
import Project from "../models/Project.js";

// Tạo task mới
export const createTask = async (req, res) => {
  try {
    const { title, projectId, assignee, status, startDate, endDate, timeSpent, parentTask } = req.body;
    const creator = req.user.id; // Lấy từ middleware auth

    const newTask = new Task({
      title,
      project: projectId,
      creator,
      assignee,
      status,
      startDate,
      endDate,
      timeSpent,
      parentTask
    });

    await newTask.save();
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
      .sort({ createdAt: -1 }); // Mới nhất lên đầu

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    // Read the 'ids' property sent from frontend
    const taskIds = req.body.ids; 
    
    if (!taskIds || !Array.isArray(taskIds)) {
       return res.status(400).json({ message: "Invalid task IDs provided."});
    }

    const result = await Task.deleteMany({ _id: { $in: taskIds } });
    res.status(200).json({ message: "Task(s) successfully deleted", deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    // Sửa ở đây: Lấy id hoặc taskId tùy thuộc vào cách bạn khai báo route
    const taskId = req.params.taskId || req.params.id; 
    const updates = req.body;
    
    if (!taskId) {
        return res.status(400).json({ message: "Task ID is required" });
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updates, { new: true });
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả task của user (Global Tasks)
export const getGlobalTasks = async (req, res) => {
  try {

    const userId = req.user.id;
    
    // Tìm danh sách ID các dự án mà user là owner hoặc member
    const myProjects = await Project.find({
      $or: [{ owner: userId }, { members: userId }]
    }).select('_id');
    const projectIds = myProjects.map(p => p._id);

    // Lấy tất cả task nằm trong các dự án đó
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


export const addTaskComment = async (req, res) => {
  try {
    const { id } = req.params; // ID của task
    const { text } = req.body;
    const userId = req.user.id;

    if (!text) return res.status(400).json({ message: "Comment text is required" });

    const task = await Task.findByIdAndUpdate(
      id,
      { $push: { comments: { user: userId, text } } },
      { new: true }
    ).populate("comments.user", "fullName avatar");

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleTaskTimer = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    let updateData = {};

    if (task.isRunning) {
      // Đang chạy -> Bấm Dừng (Pause)
      // Bảo vệ trường hợp timerStartedAt bị null do lỗi data cũ
      const startedAt = task.timerStartedAt ? new Date(task.timerStartedAt).getTime() : Date.now();
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      
      updateData = {
        isRunning: false,
        timerStartedAt: null,
        // (task.timeSpent || 0) để chống lỗi NaN nếu timeSpent chưa tồn tại
        timeSpent: (task.timeSpent || 0) + Math.max(0, elapsedSeconds) 
      };
    } else {
      // Đang dừng -> Bấm Chạy (Play)
      updateData = {
        isRunning: true,
        timerStartedAt: new Date()
      };
    }

    // Dùng findByIdAndUpdate thay cho .save() để tránh lỗi validation của các trường cũ không liên quan
    const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true });
    
    res.json(updatedTask);
  } catch (error) {
    console.error("Lỗi tại toggleTaskTimer:", error); // In ra console để dễ debug
    res.status(500).json({ message: error.message });
  }
};


//dashboard
// be/controllers/task.controller.js

export const getTaskStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Tìm các dự án mà user tham gia
    const myProjects = await Project.find({
      $or: [{ owner: userId }, { members: userId }]
    }).select('_id');
    const projectIds = myProjects.map(p => p._id);

    // 2. Lấy toàn bộ task trong các dự án đó
    const tasks = await Task.find({ project: { $in: projectIds } });

    // 3. Khởi tạo bộ đếm
    const statusCount = { "To Do": 0, "In Progress": 0, "In Review": 0, "Done": 0 };
    const priorityCount = { "high": 0, "medium": 0, "low": 0 };

    // 4. Lặp qua từng task và cộng dồn
    tasks.forEach(task => {
      if (statusCount[task.status] !== undefined) statusCount[task.status]++;
      if (priorityCount[task.priority] !== undefined) priorityCount[task.priority]++;
    });

    // 5. Trả về format đúng như Recharts cần (kèm mã màu Jira)
    res.json({
      statusStats: [
        { name: "Done", value: statusCount["Done"], color: "#36b37e" },        // Xanh lá
        { name: "In Progress", value: statusCount["In Progress"], color: "#0052cc" }, // Xanh dương
        { name: "In Review", value: statusCount["In Review"], color: "#ffab00" },     // Vàng
        { name: "To Do", value: statusCount["To Do"], color: "#42526e" }        // Xám đậm
      ],
      priorityStats: [
        { name: "High", value: priorityCount["high"], color: "#ff5630" },       // Đỏ
        { name: "Medium", value: priorityCount["medium"], color: "#ffab00" },     // Cam/Vàng
        { name: "Low", value: priorityCount["low"], color: "#36b37e" }         // Xanh lá
      ]
    });

  } catch (error) {
    console.error("Lỗi thống kê task:", error);
    res.status(500).json({ message: error.message });
  }
};

// be/controllers/task.controller.js

export const getRecentActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Tìm các dự án mà user tham gia
    const myProjects = await Project.find({
      $or: [{ owner: userId }, { members: userId }]
    }).select('_id');
    const projectIds = myProjects.map(p => p._id);

    // 2. Lấy 10 task được cập nhật (hoặc tạo) gần đây nhất
    const recentTasks = await Task.find({ project: { $in: projectIds } })
      .sort({ updatedAt: -1 }) // Sắp xếp theo thời gian cập nhật giảm dần (mới nhất lên đầu)
      .limit(10)
      .populate('creator', 'fullName avatar');

    // 3. Biến đổi dữ liệu thành dạng lịch sử hoạt động (Activity Log)
    const activities = recentTasks.map(task => {
      // Nếu thời gian tạo và cập nhật giống nhau -> Task mới được tạo
      // Nếu khác nhau -> Task vừa được chỉnh sửa
      const isNew = task.createdAt.getTime() === task.updatedAt.getTime();
      
      return {
        _id: task._id,
        user: task.creator,
        action: isNew ? "created task" : "updated task",
        taskTitle: task.title,
        taskStatus: task.status,
        timestamp: task.updatedAt
      };
    });

    res.json(activities);
  } catch (error) {
    console.error("Lỗi lấy activities:", error);
    res.status(500).json({ message: error.message });
  }
};