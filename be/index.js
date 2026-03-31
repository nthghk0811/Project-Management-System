import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';//header security
import rateLimit from 'express-rate-limit';//limit request
// import mongoSanitize from 'express-mongo-sanitize';//prevent NoSQL injection

//socket
import http from 'http'; // Import thêm http có sẵn của Node.js
import { Server } from 'socket.io';

import express from 'express';
import authRoute from './routes/auth.route.js';
import projectRoute from './routes/project.route.js';
import userRoute from './routes/user.route.js'
import taskRoute from './routes/task.route.js';
import searchRoute from './routes/search.route.js';
import notificationRoute from './routes/notification.route.js';
import supportRoute from './routes/support.route.js'; 


dotenv.config();
const PORT = process.env.PORT || 8080;
const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(helmet());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 500, 
    standardHeaders: true, 
    legacyHeaders: false, 
}));


app.use(express.json());

const server = http.createServer(app);

// 2. Gắn "Tổng đài" Socket.io lên cái HTTP server đó
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Link Frontend của bác (Vite thường dùng cổng này)
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// 3. Lắng nghe ai đó nhấc máy gọi lên
io.on("connection", (socket) => {
  console.log(`🟢 Có người vừa kết nối Socket! ID: ${socket.id}`);

  // Khi 1 user vào xem 1 Project, cho họ vào 1 "Phòng" riêng của Project đó
  socket.on("join_project_room", (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} vừa chui vào phòng Project: ${projectId}`);
  });

  socket.on("join_user_room", (userId) => {
    socket.join(userId.toString());
    console.log(`User ${userId} đã sẵn sàng nhận tin nhắn riêng.`);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 User ${socket.id} vừa ngắt kết nối!`);
  });
});

// 4. Lưu cái "Tổng đài" io này vào app để xài ké ở các file Controller
app.set("io", io);


// app.use(mongoSanitize());
app.use('/api/auth', authRoute)
app.use('/api/projects', projectRoute)
app.use('/api/users', userRoute)
app.use('/api/tasks', taskRoute);
app.use('/api/search', searchRoute)
app.use('/api/notifications', notificationRoute)
app.use('/api/support', supportRoute)

await mongoose.connect(process.env.MONGO_URI);



app.get('/', (req, res) => {
    res.send('Hello World!');
});
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
export default app;


