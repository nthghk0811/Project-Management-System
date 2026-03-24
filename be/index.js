import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';//header security
import rateLimit from 'express-rate-limit';//limit request
import mongoSanitize from 'express-mongo-sanitize';//prevent NoSQL injection
import express from 'express';
import authRoute from './routes/auth.route.js';
import projectRoute from './routes/project.route.js';
import userRoute from './routes/user.route.js'
import taskRoute from './routes/task.route.js';
import searchRoute from './routes/search.route.js';
import notificationRoute from './routes/notification.route.js';


dotenv.config();
const PORT = process.env.PORT;
const app = express();
app.use(helmet());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
}));
app.use(mongoSanitize());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use('/api/auth', authRoute)
app.use('/api/projects', projectRoute)
app.use('/api/users', userRoute)
app.use('/api/tasks', taskRoute);
app.use('/api/search', searchRoute)
app.use('/api/notifications', notificationRoute)

await mongoose.connect(process.env.MONGO_URI);



app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
export default app;


