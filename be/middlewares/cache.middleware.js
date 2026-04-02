// be/middlewares/cache.middleware.js
import redisClient from '../config/redis.js';

export const cacheDiscoverProjects = async (req, res, next) => {
  const userId = req.user.id;
  const cacheKey = `discover_projects_${userId}`; // Key cache riêng cho từng user

  try {
    // 1. Kiểm tra xem Redis có chạy không
    if (!redisClient.isReady) return next();

    // 2. Tìm data trong Redis
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log(`⚡ [Redis] Lấy data từ Cache cho key: ${cacheKey}`);
      // Parse từ chuỗi JSON về Object và trả thẳng về luôn, cắt đuôi MongoDB
      return res.status(200).json(JSON.parse(cachedData));
    }

    // 3. Nếu Cache trống, đi tiếp vào Controller
    console.log(`🐢 [MongoDB] Cache trống, đang chui vào Database...`);
    next();
  } catch (error) {
    console.error("Redis Cache Error:", error);
    next(); // Lỗi Redis thì vẫn cho chạy tiếp DB bình thường
  }
};