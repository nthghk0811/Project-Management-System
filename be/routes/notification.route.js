import express from "express";
import { authToken } from "../middlewares/auth.middleware.js";
import { getMyNotifications, markAsRead } from "../controllers/notification.controller.js";

const router = express.Router();
router.get("/", authToken, getMyNotifications);
router.put("/:id/read", authToken, markAsRead);
export default router;