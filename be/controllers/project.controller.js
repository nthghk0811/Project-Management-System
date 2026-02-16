import Project from "../models/Project.js";

// Tạo project mới
export const createProject = async (req, res) => {
  try {
    const { name, description, status, startDate, endDate } = req.body;
    const owner = req.user.id;

    const newProject = new Project({
      name,
      description,
      owner,
      members: [owner], // Người tạo mặc định là thành viên
      status,
      startDate,
      endDate,
    });

    await newProject.save();
    res.status(201).json(newProject);
  }catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

//get list myproject
export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user.id,
    })
      .populate("members", "fullName avatar")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};