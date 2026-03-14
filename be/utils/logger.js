// be/utils/logger.js
import Activity from '../models/Activity.js';

export const logActivity = async (userId, action, targetName) => {
  try {
    // Chèn 1 dòng lịch sử vào Database
    await Activity.create({
      user: userId,
      action: action,
      targetName: targetName
    });
  } catch (error) {
    console.error("Lỗi khi ghi Activity Log:", error);
    // Lưu ý: Ta chỉ console.error chứ không ném lỗi (throw error) 
    // để không làm gián đoạn luồng chạy chính của người dùng.
  }
};