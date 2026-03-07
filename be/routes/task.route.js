// be/routes/task.route.js
import express from 'express';
import { createTask, getTasksByProject, updateTask, deleteTask } from '../controllers/task.controller.js';
import { authToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authToken, createTask);
router.get('/project/:projectId', authToken, getTasksByProject);
router.put('/:taskId', authToken, updateTask);
router.post('/delete', authToken, deleteTask);

export default router;