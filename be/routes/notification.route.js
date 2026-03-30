import express from "express";
import { authToken } from "../middlewares/auth.middleware.js";
import { getMyNotifications, markAsRead, sendGlobalNotification, markAllAsRead, sendPrivateNotification } from "../controllers/notification.controller.js";

const router = express.Router();
router.get("/", authToken, getMyNotifications);
router.put("/:id/read", authToken, markAsRead);
router.post("/global", authToken, sendGlobalNotification);
router.put("/read-all", authToken, markAllAsRead);
router.post("/private", authToken, sendPrivateNotification);
export default router;