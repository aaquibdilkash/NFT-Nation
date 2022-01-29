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
    default: ""
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
  followersCount: {
    type: Number,
    default: 0
  },
  followings: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  followingsCount: {
    type: Number,
    default: 0
  },

  refer: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  // nftMinted: {
  //   type: Number,
  //   default: 0
  // },
  // nftBought: {
  //   type: Number,
  //   default: 0
  // },
  // nftSold: {
  //   type: Number,
  //   default: 0
  // },
  // nftCollected: {
  //   type: Number,
  //   default: 0
  // },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
