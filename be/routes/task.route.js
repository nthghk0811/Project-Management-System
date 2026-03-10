// be/routes/task.route.js
import express from 'express';
import { createTask, getTasksByProject, updateTask, deleteTask, getGlobalTasks, addTaskComment, toggleTaskTimer, getTaskStatistics, getRecentActivities } from '../controllers/task.controller.js';
import { authToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authToken, createTask);
router.get('/project/:projectId', authToken, getTasksByProject);
router.post('/delete', authToken, deleteTask);
router.get('/global', authToken, getGlobalTasks);

router.get('/statistics', authToken, getTaskStatistics);

router.get('/activities', authToken, getRecentActivities);

router.post('/:id/comments', authToken, addTaskComment);
router.put('/:id/timer', authToken, toggleTaskTimer);
router.put('/:id', authToken, updateTask);

export default router;