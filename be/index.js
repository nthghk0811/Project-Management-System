import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import http from 'http'; 
import { Server } from 'socket.io';

import { connectRedis } from './config/redis.js';

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

// ==========================================
// 1. CẤU HÌNH CORS CHUẨN CHO CẢ LOCAL VÀ VERCEL
// ==========================================
const allowedOrigins = [
  process.env.CLIENT_URL, 
  'http://localhost:5173' 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// ==========================================
// 2. CẤU HÌNH SOCKET.IO
// ==========================================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Dùng chung mảng VIP list ở trên cho tiện
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

io.on("connection", (socket) => {
  console.log(`🟢 Có người vừa kết nối Socket! ID: ${socket.id}`);

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

app.set("io", io);

// ==========================================
// 3. KHAI BÁO ROUTES
// ==========================================
app.use('/api/auth', authRoute)
app.use('/api/projects', projectRoute)
app.use('/api/users', userRoute)
app.use('/api/tasks', taskRoute);
app.use('/api/search', searchRoute)
app.use('/api/notifications', notificationRoute)
app.use('/api/support', supportRoute)

app.get('/', (req, res) => {
    res.send('SyncBoard Backend is running!');
});

// ==========================================
// 4. KẾT NỐI DB VÀ CHẠY SERVER ĐÚNG CÁCH
// ==========================================
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    
    await connectRedis(); 
    console.log("Connected to Redis");
    
    // GỌI ĐÚNG MỘT LẦN SERVER.LISTEN Ở ĐÂY THÔI
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Lỗi khởi động Server:", error);
  }
};

startServer();

export default app;