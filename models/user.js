import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    maxlength: [64, "userName field cannot exceeds 42 characters"],
    required: [true, "Please enter userName"],
    unique: true
  },
  address: {
    type: String,
    required: [true, "Please enter address"],
    unique: true
  },
  image: {
    type: String,
  },
  about: {
    type: String,
    maxlength: [128, "userName field cannot exceeds 80 characters"],
    unique: false
  },
  followers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  followings: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
