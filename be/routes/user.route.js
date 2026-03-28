import express from "express"
import cloudinary, { uploadLocal } from '../config/cloudinary.js';
import { getProfile, updateProfile, changePassword, getAllUsersAdmin, updateUserRole, deleteUser} from '../controllers/user.controller.js'
import {authToken} from '../middlewares/auth.middleware.js'
import User from '../models/User.js';

const router = express.Router();
router.post('/upload-avatar', authToken, uploadLocal.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataUrl = `data:${req.file.mimetype};base64,${b64}`;

    // 2. Ném lên Cloudinary
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: 'project_management_system/avatars', // Tạo folder cho gọn gàng
      resource_type: 'auto'
    });

    // 3. Lấy cái secure_url lưu thẳng vào Database
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');

    
    res.json({ 
      message: "Successful!", 
      user: updatedUser 
    });

  } catch (error) {
    console.error("Upload Avatar Error:", error);
    res.status(500).json({ message: "Lỗi server khi tải ảnh lên." });
  }
});

router.get("/me", authToken, getProfile);
router.put("/me", authToken, updateProfile);
router.put("/change-password", authToken, changePassword);



router.get("/admin/all", authToken, getAllUsersAdmin);
router.put("/admin/:id/role", authToken, updateUserRole);
router.delete("/admin/:id", authToken, deleteUser);

export default router
