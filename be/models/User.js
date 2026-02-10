import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: Date,
  },
  { timestamps: true }
);
const User = mongoose.model('User', userSchema);
export default User;