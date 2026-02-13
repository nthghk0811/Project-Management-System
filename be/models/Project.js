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

    // người tạo project
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // danh sách thành viên
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    status: {
      type: String,
      enum: ["planning", "active", "completed"],
      default: "planning",
    },

    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;