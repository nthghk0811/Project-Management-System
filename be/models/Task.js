import mongoose from 'mongoose';

const subTaskSchema = new mongoose.Schema(
    {
    title: {
        type: String,
        required: true,
        trim: true
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    },
    { _id: true}
);

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dueDate: {
    type: Date,
  },
  subTasks: [subTaskSchema],
   priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending',
  },
  estimatedTime: {
    type: Number, //mins
  },
    actualTime: {
    type: Number,
    default: 0 //mins
  },
  commentsCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });


const Task = mongoose.model('Task', TaskSchema);

export default Task;