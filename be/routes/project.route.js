import express from "express";
import {
  createProject,
  getMyProjects,
  getProjectById,
  getDiscoverProjects, // Import thêm
  joinProject,         // Import thêm
  leaveProject,        // Import thêm
  deleteProject,
  updateProject,
  approveJoinRequest,
  rejectJoinRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  getPendingRequests,
  uploadProjectResource,
  removeMemberFromProject

} from "../controllers/project.controller.js";
import { uploadLocal } from "../config/cloudinary.js";
import { authToken, adminAuth } from "../middlewares/auth.middleware.js";
import { cacheDiscoverProjects } from "../middlewares/cache.middleware.js";

const router = express.Router();

router.get("/discover", authToken, cacheDiscoverProjects, getDiscoverProjects); // Route để khám phá dự án
router.post("/:id/join", authToken, joinProject); // Route để tham gia dự án(admin duyệt)
router.post("/:id/leave", authToken, leaveProject); // Route để rời khỏi dự án(admin duyệt)
router.delete("/:id", authToken, deleteProject); // Route để xóa dự án (chỉ cho phép Owner)

//admin routes
router.post("/:id/approve-join/:userId", authToken, adminAuth, approveJoinRequest);
router.post("/:id/reject-join/:userId", authToken, adminAuth, rejectJoinRequest);
router.post("/:id/approve-leave/:userId", authToken, adminAuth, approveLeaveRequest);
router.post("/:id/reject-leave/:userId", authToken, adminAuth, rejectLeaveRequest);
router.get("/:id/pending-requests", authToken, adminAuth, getPendingRequests);

router.post("/", authToken, createProject);
router.get("/", authToken, getMyProjects);
router.get("/:id", authToken, getProjectById);
router.put("/:id", authToken, updateProject); // Route để cập nhật dự án
router.post('/:id/resources', authToken, uploadLocal.single('file'), uploadProjectResource);
router.delete("/:id/members/:userId", authToken, removeMemberFromProject);

export default router;