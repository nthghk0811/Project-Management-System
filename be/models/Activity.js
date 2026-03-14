// be/models/activity.model.js
import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // VD: "deleted project", "changed priority to High"
  targetName: { type: String, required: true }, // Tên dự án hoặc tên Task
}, { timestamps: true });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;