import Project from "../models/Project.js";
import Task from "../models/Task.js";

/* CREATE */
export const createProject = async (req, res) => {
  try {
    const { name, description, status, startDate, endDate } = req.body;
    const owner = req.user.id;

    const newProject = new Project({
      name,
      description,
      owner,
      members: [owner],
      status,
      startDate,
      endDate,
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* GET MY PROJECTS */
export const getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm dự án mà user là owner hoặc nằm trong mảng members
    const projects = await Project.find({
      $or: [{ owner: userId }, { members: userId }]
    })
      .populate("owner", "fullName")
      .sort({ createdAt: -1 })
      .lean(); // Dùng .lean() để chuyển thành object thuần

    // Map qua từng dự án và đếm số lượng Task tương ứng
    const projectsWithTaskCount = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ project: project._id });
        return { ...project, taskCount }; // Gắn thêm field taskCount
      })
    );

    res.json(projectsWithTaskCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members", "fullName avatar")
      .populate("owner", "fullName avatar");

    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDiscoverProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm các dự án mà user KHÔNG phải owner VÀ KHÔNG nằm trong members
    const projects = await Project.find({
      owner: { $ne: userId },
      members: { $ne: userId }
    })
      .populate('owner', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    // Tương tự, đếm số lượng Task cho các dự án này
    const projectsWithTaskCount = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ project: project._id });
        return { ...project, taskCount };
      })
    );

    res.json(projectsWithTaskCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Tham gia dự án
export const joinProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Thêm userId vào mảng members bằng $addToSet (chỉ thêm nếu chưa có)
    const project = await Project.findByIdAndUpdate(
      id,
      { $addToSet: { members: userId } },
      { new: true }
    );
    res.json({ message: "Joined successfully", project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Rời dự án
export const leaveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // NẾU NGƯỜI RỜI LÀ OWNER -> XÓA DỰ ÁN
    if (project.owner.toString() === userId) {
      await Project.findByIdAndDelete(id);
      
      // Lời khuyên: Nếu dự án có các Task/Issue bên trong, 
      // bạn cũng nên xóa các Task đó luôn ở đây để tránh rác database:
      // await Task.deleteMany({ project: id });

      return res.json({ 
        message: "Vì bạn là Owner, dự án đã bị xóa hoàn toàn khi bạn rời đi.",
        action: "deleted"
      });
    }

    // NẾU LÀ MEMBER BÌNH THƯỜNG -> CHỈ RỜI KHỎI MẢNG MEMBERS
    await Project.findByIdAndUpdate(id, { $pull: { members: userId } });
    res.json({ message: "Đã rời khỏi dự án thành công.", action: "left" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// be/controllers/project.controller.js

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });


    const ownerId = project.owner ? project.owner.toString() : null;

    if (ownerId && ownerId !== userId) {
      return res.status(403).json({ message: "Only the owner can delete this project" });
    }

    await Project.findByIdAndDelete(id);
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};