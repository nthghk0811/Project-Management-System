import express from "express"
import { getProfile, updateProfile, changePassword} from '../controllers/user.controller.js'
import {authToken} from '../middlewares/auth.middleware.js'

const router = express.Router();

router.get("/me", authToken, getProfile);
router.put("/me", authToken, updateProfile);
router.put("/change-password", authToken, changePassword);
export default router
