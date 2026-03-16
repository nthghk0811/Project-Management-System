import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


//admin
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Kiểm tra user có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // 2. Kiểm tra mật khẩu
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // 3. KIỂM TRA QUYỀN
    if (user.role !== "admin" && user.role !== "Leader") {
      return res.status(403).json({ 
        message: "Access denied. You do not have administrator privileges." 
      });
    }

    // 4. Tạo token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret_key", // Nhớ thay bằng secret thật của bạn
      { expiresIn: "1d" }
    );

    // Trả về thông tin
    res.json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


export const register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    };

    const saltRounds = 10;

    const salt = bcrypt.genSaltSync(saltRounds);
 
  const hash = bcrypt.hashSync(password, salt);
    // Create new user
    const newUser = new User({
      email,
      password: hash,
      fullName,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', data: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role
     }, token});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
    try{
        const { email, password, fullName } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return  res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({ message: 'Login successful', user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role
         }, token});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};


