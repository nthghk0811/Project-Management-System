import express from 'express';
import { register, login , getMe} from '../controllers/auth.controller.js';
import {authToken} from '../middlewares/auth.middleware.js';

const router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.get('/me', authToken, getMe);

export default router;