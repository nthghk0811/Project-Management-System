// be/config/redis.js
import { createClient } from 'redis';



const redisClient = createClient({
    url: process.env.REDIS_HOST
});

redisClient.on('error', (err) => console.log(err));
redisClient.on('connect', () => console.log('Successful'));

// Hàm khởi động Redis
export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("R");
  }
};

export default redisClient;