// be/controllers/search.controller.js
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

export const globalSearch = async (req, res) => {
  try {
    const { q = "", time = "Any time", status = "" } = req.query;
    if (!q.trim()) return res.json([]);

    const userId = req.user.id;
    const isAdmin = req.user.role === "Admin" || req.user.role === "Leader";
    const regex = new RegExp(q, "i");

    // --- XỬ LÝ LỌC THEO THỜI GIAN (LAST UPDATED) ---
    let dateFilter = {};
    const now = new Date();
    if (time === "Today") {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { updatedAt: { $gte: startOfToday } };
    } else if (time === "Yesterday") {
      const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { updatedAt: { $gte: startOfYesterday, $lt: startOfToday } };
    } else if (time === "Past 7 days") {
      const past7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { updatedAt: { $gte: past7Days } };
    }

    // --- XỬ LÝ LỌC THEO TRẠNG THÁI (STATUS) ---
    // status truyền lên từ frontend là string ngăn cách bằng dấu phẩy: "To Do,Done"
    let statusFilter = {};
    if (status) {
      const statusArray = status.split(",");
      statusFilter = { status: { $in: statusArray } };
    }

    // --- TẠO BỘ LỌC CHO TỪNG BẢNG ---
    const projectFilter = isAdmin 
      ? { name: regex, ...dateFilter } 
      : { name: regex, ...dateFilter, $or: [{ owner: userId }, { members: userId }] };

    let taskFilter = { title: regex, ...dateFilter, ...statusFilter }; // Task ăn cả Status filter
    if (!isAdmin) {
      const myProjects = await Project.find({ $or: [{ owner: userId }, { members: userId }] }).select("_id");
      const projectIds = myProjects.map(p => p._id);
      taskFilter = { 
        ...taskFilter,
        $or: [{ project: { $in: projectIds } }, { assignee: userId }, { creator: userId }] 
      };
    }

    const userFilter = { fullName: regex, ...dateFilter };

    // --- TRUY VẤN SONG SONG ---
    const [projects, tasks, users] = await Promise.all([
      Project.find(projectFilter).limit(5).lean(),
      Task.find(taskFilter).limit(10).lean(),
      User.find(userFilter).limit(5).lean()
    ]);

    // --- ĐỒNG NHẤT DỮ LIỆU ĐẦU RA ---
    const results = [];
    projects.forEach(p => results.push({ id: p._id.toString().slice(-5).toUpperCase(), type: "Project", title: p.name, status: p.status === "completed" ? "Done" : "Active", url: `/projects/${p._id}` }));
    tasks.forEach(t => {
      const projectId = t.project ? t.project.toString() : "";
      results.push({ id: t._id.toString().slice(-5).toUpperCase(), type: "Task", title: t.title, status: t.status, url: projectId ? `/projects/${projectId}` : `/dashboard` });
    });
    users.forEach(u => results.push({ id: u._id.toString().slice(-5).toUpperCase(), type: "Member", title: u.fullName, status: u.role || "Member", url: `/profile` }));

    res.json(results.slice(0, 10));

  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Error occurred while searching" });
  }
};