// be/controllers/notification.controller.js
import Notification from "../models/Notification.js";
import User from "../models/User.js"; // Nhớ import User để lấy danh sách

// Lấy thông báo của user
export const getMyNotifications = async (req, res) => {
  try {
    const notifs = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10); // Lấy 10 cái mới nhất cho đỡ nặng
    res.json(notifs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đánh dấu đã đọc
export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==== TÍNH NĂNG MỚI: BẮN THÔNG BÁO TOÀN CẦU (GLOBAL) ====
export const sendGlobalNotification = async (req, res) => {
  try {
    // 1. Chốt chặn an toàn: Chỉ sếp mới được xài loa phường
    const isAdmin = req.user.role && req.user.role.toLowerCase() === "admin";
    if (!isAdmin) {
      return res.status(403).json({ message: "Chỉ Admin mới có quyền gửi thông báo toàn hệ thống!" });
    }

    const { title, desc } = req.body;
    if (!title || !desc) return res.status(400).json({ message: "Thiếu tiêu đề hoặc nội dung!" });

    // 2. Lấy ID của TẤT CẢ user trong hệ thống
    const allUsers = await User.find({}).select('_id');

    // 3. Nhân bản thông báo cho từng người (để quản lý trạng thái isRead riêng biệt)
    const notifsToInsert = allUsers.map(u => ({
      recipient: u._id,
      title,
      desc,
      isRead: false
    }));

    // Insert 1 phát hết luôn (Nhanh hơn gọi save() trong vòng lặp)
    await Notification.insertMany(notifsToInsert);

    //socket
    const io = req.app.get("io");
    if (io) {
      // Emit object giả lập giống hệt DB để Frontend hiển thị luôn
      io.emit("new_global_notification", {
        _id: Math.random().toString(36), // ID tạm để React làm key (khi F5 sẽ lấy ID thật từ DB sau)
        title,
        desc,
        isRead: false,
        createdAt: new Date()
      });
    }

    res.status(200).json({ message: `Messages sent to ${allUsers.length} users!` });
  } catch (error) {
    console.error("Error sending messages:", error);
    res.status(500).json({ message: "Error sending messages:" });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    // Tìm tất cả thông báo của user này mà chưa đọc, chuyển hết thành true
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false }, 
      { isRead: true }
    );
    res.json({ message: "Đã đánh dấu đọc tất cả!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const getAllSupportMessages = async (req, res) => {
  try {
    const messages = await Contact.find()
      .populate("user", "fullName avatar email") // Nếu tin nhắn có reference tới User
      .sort({ createdAt: -1 }); // Lấy mới nhất lên đầu
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendPrivateNotification = async (req, res) => {
  try {
    const isAdmin = req.user.role && req.user.role.toLowerCase() === "admin";
    if (!isAdmin) return res.status(403).json({ message: "Chỉ Admin mới có quyền!" });

    const { recipientId, title, desc } = req.body;
    if (!recipientId || !title || !desc) return res.status(400).json({ message: "Thiếu thông tin!" });

    // Tạo thông báo vào DB
    const noti = new Notification({ recipient: recipientId, title, desc, isRead: false });
    await noti.save();

    // 📢 BẮN SOCKET: Chỉ bắn thẳng vào cái phòng của đúng thằng user đó!
    const io = req.app.get("io");
    if (io) {
      // Dùng chung tên event "new_global_notification" để Frontend xài chung 1 hàm hứng luôn cho nhàn
      io.to(recipientId.toString()).emit("new_global_notification", noti);
    }

    res.status(200).json({ message: "Đã gửi mật thư thành công!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};