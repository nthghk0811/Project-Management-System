import User from "../models/User.js";
import bcrypt from 'bcryptjs'

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, avatar, phone, location, bio, jobTitle, skills } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, avatar, phone, location, bio, jobTitle, skills },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findById(req.user.id);

    const isMatch = bcrypt.compareSync(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashed = bcrypt.hashSync(newPassword, salt);

    user.password = hashed;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



//admin
export const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ lastLogin: -1, createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Đổi quyền User (Admin <-> Member)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    //block admin self-kill:)
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: "You cannot change your own role!" });
    }

    
    if (!['admin', 'Member'].includes(role)) {
      return res.status(400).json({ message: "Unauthorized!" });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { role }, 
      { new: true }
    ).select('-password');
    
    res.json({ message: `${role} updated for ${user.fullName}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Xóa User
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    //block admin self-kill:)
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: "You cannot change your own role!" });
    }
    res.json({ message: "User deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role, jobTitle } = req.body;

    // 1. Kiểm tra xem email đã bị thằng nào dùng chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email này đã tồn tại trong hệ thống!" });
    }

    // 2. Băm nát cái Password ra cho bảo mật (giống lúc Register)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Tạo tài khoản mới với các field chuẩn chỉ
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: role ? role.toLowerCase() : "member", // Mặc định là member nếu không có role hoặc role không hợp lệ
      jobTitle: jobTitle || "Team Member",
      // Avatar mượn tạm UI-Avatars cho nó chuyên nghiệp
      avatar: `https://ui-avatars.com/api/?name=${fullName.replace(/ /g, '+')}&background=0D8ABC&color=fff`
    });

    await newUser.save();

    // 4. Trả về cục data sạch sẽ (Tuyệt đối KHÔNG trả về password)
    const userResponse = {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      jobTitle: newUser.jobTitle,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
      lastLogin: null // Mới tạo nên chưa login bao giờ
    };

    res.status(201).json({ message: "Tạo tài khoản thành công!", user: userResponse });
  } catch (error) {
    console.error("Lỗi tạo user:", error);
    res.status(500).json({ message: "Lỗi server khi tạo tài khoản." });
  }
};