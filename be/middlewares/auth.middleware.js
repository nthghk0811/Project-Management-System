import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export const authToken = (req, res, next) => {
    try{
        const bearer = req.headers['authorization'];
        if (!bearer) {
            return res.status(401).json({ message: 'Access token missing' });
        }
        const token = bearer.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Access token missing' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid access token' });
            }
            req.user = user;
            next();
        });
    } catch (error) {
        res.json({ error: error.message });
    }
}



export const adminAuth = (req, res, next) => {
  // Giả sử sau khi đi qua authToken middleware, req.user đã có data
  if (req.user && (req.user.role.toLowerCase() === "admin")) {
    next(); // Cho phép đi tiếp vào Controller
  } else {
    res.status(403).json({ message: "Access denied. Only Admins/Leaders can perform this action." });
  }
};

