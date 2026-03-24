// be/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Dùng memoryStorage y hệt như sáng kiến của bác
const storage = multer.memoryStorage();
export const uploadLocal = multer({ storage }); 

export default cloudinary;