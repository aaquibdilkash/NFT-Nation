import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [64, "subject field cannot exceeds 64 characters"],
  },
  subject: {
    type: String,
    required: [true, "Please enter the subject."],
    trim: true,
    maxlength: [80, "subject field cannot exceeds 64 characters"],
  },
  description: {
    type: String,
    required: [true, "Please enter the description."],
    trim: true,
    maxlength: [256, "description field cannot exceeds 64 characters"],
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  wayToReach: {
    type: String,
  },
  reachId: {
    type: String,
  },
  postedBy: {
    type: String,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '30d'
  },
});

export default mongoose.models?.Message || mongoose.model("Message", messageSchema);
