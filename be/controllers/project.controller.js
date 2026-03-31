// be/controllers/project.controller.js
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { logActivity } from "../utils/logger.js";
import cloudinary from "../config/cloudinary.js";

/* CREATE */
/* CREATE PROJECT */
export const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, type, members } = req.body;
    const owner = req.user.id;


    let projectMembers = [owner];

    // Nếu Admin có chọn thêm ai đó thì ghép mảng vào (lọc trùng lặp)
    if (members && Array.isArray(members)) {
      projectMembers = [...new Set([...projectMembers, ...members])];
    }
    const newProject = new Project({
      name,
      type,
      description,
      owner,
      members: projectMembers,
      status: "planning",
      startDate,
      endDate,
    });

    await newProject.save();

    await logActivity(owner, "created project", name);

    const io = req.app.get("io");
    if (io) io.emit("project_list_updated");

    res.status(201).json(newProject);
  } catch (err) {
    console.error("Create Project Error:", err);
    res.status(500).json({ message: "Server error while creating project" });
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


// 4. Xóa Project trực tiếp
export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role ? req.user.role.toLowerCase() : "";
    // 1. Tìm dự án
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // 2. CHỐT CHẶN PHÂN QUYỀN (AUTHORIZATION)
    const isOwner = project.owner.toString() === userId;
    const isAdmin = userRole === "admin" || userRole === "leader";

    // Nếu KHÔNG PHẢI chủ dự án VÀ CŨNG KHÔNG PHẢI Admin -> Đá văng ra ngoài!
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied! Only the project owner or Admins can delete this project." });
    }

    // 3. Tiến hành xóa nếu thỏa mãn điều kiện
    await Project.findByIdAndDelete(projectId);

    // Khuyến nghị: Xóa luôn các Task thuộc Project này cho sạch Database
    await Task.deleteMany({ project: projectId });

    const io = req.app.get("io");
    if (io) io.emit("project_list_updated");

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// be/controllers/project.controller.js

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // 1. Check quyền Chủ dự án
    const isOwner = project.owner && project.owner.toString() === userId;
    
    // 2. 🛡️ Check quyền Admin: Lấy thông tin NÓNG hổi thẳng từ Database!
    const currentUser = await User.findById(userId);
    const isAdmin = currentUser && currentUser.role && currentUser.role.toLowerCase() === "admin";

    // Nếu KHÔNG PHẢI chủ dự án VÀ CŨNG KHÔNG PHẢI Admin -> Đá văng ra ngoài!
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied. Only the owner or Admin can update this project." });
    }

    const updatedProject = await Project.findByIdAndUpdate(id, req.body, { new: true });

    // Ghi log nếu có đổi status
    if (req.body.status && req.body.status !== project.status) {
      await logActivity(userId, `changed project status to ${req.body.status}`, project.name);
    }

    //socket
    const io = req.app.get("io");
    io.to(id.toString()).emit("project_updated", { action: "update" });

    res.json(updatedProject);
  } catch (error) {
    console.error("Lỗi Update Project:", error);
    res.status(500).json({ message: error.message });
  }
};



//new
export const joinProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // ÉP VỀ CHỮ THƯỜNG ĐỂ KHÔNG BAO GIỜ BẮT TRƯỢT
    const userRole = req.user.role ? req.user.role.toLowerCase() : "";

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.members.includes(userId)) {
      return res.status(400).json({ message: "You are already a member of this project." });
    }

    // KIỂM TRA BẰNG CHỮ THƯỜNG
    if (userRole === "admin" || userRole === "leader") {
      await Project.findByIdAndUpdate(
        id,
        { $addToSet: { members: userId } },
        { new: true }
      );

      return res.json({
        message: "You are an Admin. Joined project instantly!",
        isAdminJoin: true
      });
    }

    // ==== DÀNH CHO MEMBER ====
    await Project.findByIdAndUpdate(
      id,
      { $addToSet: { pendingJoinRequests: userId } },
      { new: true }
    );

    res.json({ message: "Join request sent to Admin successfully.", isAdminJoin: false });
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


// be/controllers/project.controller.js

export const getPendingRequests = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID của project
    const project = await Project.findById(id)
      .populate('pendingJoinRequests', 'fullName avatar')
      .populate('pendingLeaveRequests', 'fullName avatar');

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Trả về thẳng object chứa 2 mảng user
    res.json({
      pendingJoinRequests: project.pendingJoinRequests,
      pendingLeaveRequests: project.pendingLeaveRequests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//up resources
export const uploadProjectResource = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Không tìm thấy file!" });
    
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Không tìm thấy dự án" });

    // Dùng Base64 để bắn file lên Cloudinary (chuẩn xịn giống bài Avatar)
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataUrl = `data:${req.file.mimetype};base64,${b64}`;

    // Ném lên mây, set resource_type là 'auto' để nó nhận cả PDF, DOCX, ZIP...
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: `project_management_system/projects/${projectId}`, // Lưu riêng theo ID dự án
      resource_type: 'auto' 
    });

    // Tạo object tài nguyên mới
    const newResource = {
      name: req.file.originalname,
      url: result.secure_url,
      type: req.file.mimetype.startsWith('image/') ? 'image' : 'raw', // Nhận diện ảnh hay tài liệu
      uploadedBy: req.user.id
    };

    // Đẩy vào mảng và lưu lại
    project.resources.push(newResource);
    await project.save();

    const io = req.app.get("io");
    io.to(projectId.toString()).emit("project_updated", { action: "upload" });

    res.json({ message: "Tải lên thành công!", resource: newResource });

  } catch (error) {
    console.error("Upload Resource Error:", error);
    res.status(500).json({ message: "Lỗi server khi upload tài liệu" });
  }
};



export const removeMemberFromProject = async (req, res) => {
  try {
    const { id, userId } = req.params; // id là Project ID
    const requesterId = req.user.id;
    const requesterRole = req.user.role ? req.user.role.toLowerCase() : "";

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Không tìm thấy dự án!" });

    // 1. Phân quyền: Chỉ Admin hoặc Project Owner mới được đuổi người
    const isOwner = project.owner.toString() === requesterId;
    const isAdmin = requesterRole === "admin" || requesterRole === "leader";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Chỉ Admin hoặc Chủ dự án mới có quyền này!" });
    }

    // Không ai được phép đuổi Chủ dự án (Owner)
    if (project.owner.toString() === userId) {
      return res.status(400).json({ message: "Không thể đuổi Chủ dự án ra khỏi dự án của chính họ!" });
    }

    // 2. Trục xuất khỏi mảng members
    await Project.findByIdAndUpdate(id, { $pull: { members: userId } });

    // 3. Tịch thu công việc: Gỡ assign toàn bộ Task của thanh niên này trong dự án
    await Task.updateMany(
      { project: id, assignee: userId },
      { $set: { assignee: null } }
    );

    // 4. Ghi Log
    await logActivity(requesterId, "removed a member from", project.name);

    // 5. 📢 BẮN SOCKET: Báo cho mọi người trong phòng biết sự biến động
    const io = req.app.get("io");
    if (io) {
      io.to(id.toString()).emit("project_updated", { action: "remove_member" });
      io.to(id.toString()).emit("task_updated", { action: "unassigned_tasks" }); // Load lại task vì bị gỡ assign
    }

    res.json({ message: "Đã đuổi thành viên khỏi dự án thành công!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};