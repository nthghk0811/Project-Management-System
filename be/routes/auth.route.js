import express from 'express';
import { register, login , getMe, adminLogin, getAllUsers} from '../controllers/auth.controller.js';
import {authToken} from '../middlewares/auth.middleware.js';

const router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.get('/me', authToken, getMe);
router.post('/admin/login', adminLogin);
// Thêm route lấy tất cả user (chỉ dành cho Admin/Leader nếu muốn rào kỹ)
router.get('/users', authToken, getAllUsers);

export default router;