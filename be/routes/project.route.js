import express from 'express';
import { createProject, getMyProjects } from '../controllers/project.controller.js';
import { authToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authToken, createProject);
router.get('/', authToken, getMyProjects);

export default router;