// be/routes/search.route.js
import express from "express";
import { authToken } from "../middlewares/auth.middleware.js";
import { globalSearch } from "../controllers/search.controller.js";

const router = express.Router();

router.get("/", authToken, globalSearch);

export default router;