import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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


