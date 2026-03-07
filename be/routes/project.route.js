import express from "express";
import {
  createProject,
  getMyProjects,
  getProjectById,
  getDiscoverProjects, // Import thêm
  joinProject,         // Import thêm
  leaveProject,        // Import thêm
  deleteProject

} from "../controllers/project.controller.js";
import { authToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/discover", authToken, getDiscoverProjects); // Route để khám phá dự án
router.post("/:id/join", authToken, joinProject); // Route để tham gia dự án
router.post("/:id/leave", authToken, leaveProject); // Route để rời khỏi dự án
router.delete("/:id", authToken, deleteProject); // Route để xóa dự án (chỉ cho phép Owner)

router.post("/", authToken, createProject);
router.get("/", authToken, getMyProjects);
router.get("/:id", authToken, getProjectById);

export default router;