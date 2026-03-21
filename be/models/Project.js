import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

    ],
    type: {
    type: String,
    default: "Software Development"
  },
    // BỔ SUNG: Hàng đợi chờ Admin duyệt
    pendingJoinRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    pendingLeaveRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      default: "planning", 
    },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;