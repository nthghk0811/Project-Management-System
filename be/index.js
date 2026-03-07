import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import authRoute from './routes/auth.route.js';
import projectRoute from './routes/project.route.js';
import userRoute from './routes/user.route.js'
import taskRoute from './routes/task.route.js';

dotenv.config();
const PORT = process.env.PORT;
const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use('/api/auth', authRoute)
app.use('/api/projects', projectRoute)
app.use('/api/users', userRoute)
app.use('/api/tasks', taskRoute);

await mongoose.connect(process.env.MONGO_URI);
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
export default app;


