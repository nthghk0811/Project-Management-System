import express from "express";
import { createTicket, getAllTickets } from "../controllers/support.controller.js";
import { authToken, adminAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authToken, createTicket); // Ai cũng gửi được
router.get("/", authToken, adminAuth, getAllTickets); // Chỉ Sếp mới được xem

export default router;