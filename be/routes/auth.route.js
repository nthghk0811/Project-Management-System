import express from 'express';
import {body} from 'express-validator';
import { register, login , getMe, getAllUsers} from '../controllers/auth.controller.js';
import {authToken} from '../middlewares/auth.middleware.js';

const router = express.Router();


router.post('/register', [
  body('fullName').notEmpty().withMessage('Full name is required').trim().escape(),
  body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
], login);

// Admin login
// router.post('/admin/login', [
//   body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
//   body('password').notEmpty().withMessage('Password is required')
// ], adminLogin);

router.get('/me', authToken, getMe);
router.get('/users', authToken, getAllUsers);

export default router;
