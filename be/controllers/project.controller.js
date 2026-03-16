// be/controllers/project.controller.js
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { logActivity } from "../utils/logger.js"; // BỔ SUNG IMPORT NÀY

/* CREATE */
export const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body;
    const owner = req.user.id;

    const newProject = new Project({
      name, description, owner, members: [owner], status: "planning", startDate, endDate,
    });

    await newProject.save();

    // === GHI LOG: TẠO PROJECT ===
    await logActivity(owner, "created project", name);

    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* GET MY PROJECTS */
export const getMyProjects = async (req, res) => {
  // ... Giữ nguyên như cũ
  try {
    const userId = req.user.id;
    const projects = await Project.find({ $or: [{ owner: userId }, { members: userId }] })
      .populate("owner", "fullName")
      .sort({ createdAt: -1 })
      .lean();

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

export const getProjectById = async (req, res) => {
  // ... Giữ nguyên như cũ
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
  // ... Giữ nguyên như cũ
  try {
    const userId = req.user.id;
    const projects = await Project.find({ owner: { $ne: userId }, members: { $ne: userId } })
      .populate('owner', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

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

// // 2. Tham gia dự án
// export const joinProject = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;

//     const project = await Project.findByIdAndUpdate(
//       id, { $addToSet: { members: userId } }, { new: true }
//     );

//     // === GHI LOG: JOIN PROJECT ===
//     await logActivity(userId, "joined project", project.name);

//     res.json({ message: "Joined successfully", project });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// 3. Rời dự án
// export const leaveProject = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;

//     const project = await Project.findById(id);
//     if (!project) return res.status(404).json({ message: "Project not found" });

//     if (project.owner.toString() === userId) {
//       // GHI LOG TRƯỚC KHI XÓA
//       await logActivity(userId, "deleted project", project.name);

//       await Project.findByIdAndDelete(id);
//       return res.json({ message: "Vì bạn là Owner, dự án đã bị xóa hoàn toàn khi bạn rời đi.", action: "deleted" });
//     }

//     // GHI LOG RỜI DỰ ÁN
//     await logActivity(userId, "left project", project.name);

//     await Project.findByIdAndUpdate(id, { $pull: { members: userId } });
//     res.json({ message: "Đã rời khỏi dự án thành công.", action: "left" });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// 4. Xóa Project trực tiếp
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

    // === GHI LOG TRƯỚC KHI XÓA ===
    await logActivity(userId, "deleted project", project.name);

    await Project.findByIdAndDelete(id);
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Chỉ Owner mới được phép đổi trạng thái dự án
    if (project.owner.toString() !== userId) {
      return res.status(403).json({ message: "Only the owner can update this project" });
    }

    const updatedProject = await Project.findByIdAndUpdate(id, updateData, { new: true });

    // === GHI LOG KHI ĐỔI TRẠNG THÁI ===
    if (updateData.status && updateData.status !== project.status) {
      await logActivity(userId, `changed project status to ${updateData.status}`, project.name);
    }

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//new
export const joinProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Kiểm tra xem đã là member chưa
    if (project.members.includes(userId)) {
      return res.status(400).json({ message: "You are already a member of this project." });
    }

    // Đẩy vào hàng đợi Join
    await Project.findByIdAndUpdate(
      id, { $addToSet: { pendingJoinRequests: userId } }, { new: true }
    );

    res.json({ message: "Join request sent to Admin successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Gửi yêu cầu rời dự án (hoặc Owner xóa dự án)
export const leaveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Nếu là Owner -> Xóa luôn không cần duyệt
    if (project.owner.toString() === userId) {
      await logActivity(userId, "deleted project", project.name);
      await Project.findByIdAndDelete(id);
      return res.json({ message: "Project deleted permanently.", action: "deleted" });
    }

    // Nếu là Member -> Đẩy vào hàng đợi Leave
    await Project.findByIdAndUpdate(id, { $addToSet: { pendingLeaveRequests: userId } });
    
    res.json({ message: "Leave request sent to Admin. Please wait for approval.", action: "requested" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =========================================================
// PHẦN 2: LUỒNG DÀNH CHO ADMIN (DUYỆT YÊU CẦU)
// =========================================================

// Admin duyệt xin vào (Approve Join)
export const approveJoinRequest = async (req, res) => {
  try {
    const { id, userId } = req.params; // id là Project ID

    const project = await Project.findByIdAndUpdate(id, {
      $pull: { pendingJoinRequests: userId }, // Xóa khỏi hàng đợi
      $addToSet: { members: userId }          // Thêm vào danh sách chính thức
    }, { new: true });

    await logActivity(userId, "joined project", project.name);

    res.json({ message: "User approved to join the project." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin từ chối xin vào (Reject Join)
export const rejectJoinRequest = async (req, res) => {
  try {
    const { id, userId } = req.params;

    await Project.findByIdAndUpdate(id, {
      $pull: { pendingJoinRequests: userId }
    });

    res.json({ message: "Join request rejected." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin duyệt xin ra (Approve Leave)
export const approveLeaveRequest = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const project = await Project.findByIdAndUpdate(id, {
      $pull: { pendingLeaveRequests: userId, members: userId } // Xóa khỏi cả hàng đợi và list members
    }, { new: true });

    await logActivity(userId, "left project", project.name);

    res.json({ message: "User approved to leave the project." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin từ chối xin ra (Reject Leave)
export const rejectLeaveRequest = async (req, res) => {
  try {
    const { id, userId } = req.params;

    await Project.findByIdAndUpdate(id, {
      $pull: { pendingLeaveRequests: userId } // Chỉ xóa khỏi hàng đợi (vẫn bị giữ lại dự án)
    });

    res.json({ message: "Leave request rejected. User is kept in the project." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};