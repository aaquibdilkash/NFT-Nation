import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    maxlength: [64, "userName field cannot exceeds 64 characters"],
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
  createdAt: {
    type: Date,
    default: Date.now
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
