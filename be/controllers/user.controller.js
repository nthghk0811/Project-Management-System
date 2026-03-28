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
    // Chặn cứng chỉ cho phép 2 role này
    if (!['admin', 'Member'].includes(role)) {
      return res.status(400).json({ message: "Quyền không hợp lệ!" });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { role }, 
      { new: true }
    ).select('-password');
    
    res.json({ message: `Đã cấp quyền ${role} cho ${user.fullName}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Xóa User
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã tiễn user ra chuồng gà thành công!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};