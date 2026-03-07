// be/controllers/task.controller.js
import Task from "../models/Task.js";

// Tạo task mới
export const createTask = async (req, res) => {
  try {
    const { title, projectId, assignee, status, startDate, endDate, timeSpent } = req.body;
    const creator = req.user.id; // Lấy từ middleware auth

    const newTask = new Task({
      title,
      project: projectId,
      creator,
      assignee,
      status,
      startDate,
      endDate,
      timeSpent
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