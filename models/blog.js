import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter the title."],
    trim: true,
    maxlength: [42, "title field cannot exceeds 64 characters"],
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: [80, "about field cannot exceeds 128 characters"],
  },
  category: {
    type: String,
    required: true,
  },
  tags: {
    type: Array,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  postedBy: {
    type: String,
    ref: "User",
    required: true,
  },
  saved: [
    {
      type: String,
      ref: "User",
      required: true,
    },
  ],
  status: {
    type: String,
    required: true,
    default: "reviewing"
  },
  comments: [
    {
      user: {
        type: String,
        ref: "User",
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models?.Blog || mongoose.model("Blog", blogSchema);
