import SupportTicket from "../models/SupportTicket.js";

// Nhân viên gửi tin nhắn
export const createTicket = async (req, res) => {
  try {
    const newTicket = new SupportTicket({
      user: req.user.id,
      message: req.body.message
    });
    await newTicket.save();

    // Lấy kèm thông tin user (tên, avatar) để trả về
    const populatedTicket = await SupportTicket.findById(newTicket._id).populate("user", "fullName avatar email");

    // 📢 BẮN SOCKET: Hét lên hệ thống là có người vừa gửi Ticket!
    const io = req.app.get("io");
    if (io) {
      io.emit("new_support_ticket", populatedTicket);
    }

    res.status(201).json({ message: "Gửi yêu cầu thành công!", ticket: populatedTicket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin lấy danh sách tin nhắn
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate("user", "fullName avatar email")
      .sort({ createdAt: -1 }); // Lấy mới nhất lên đầu
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};