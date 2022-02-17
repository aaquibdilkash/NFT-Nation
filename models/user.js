import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      maxlength: [16, "userName field cannot exceeds 42 characters"],
      required: [true, "Please enter userName"],
      unique: true,
    },
    image: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      maxlength: [128, "userName field cannot exceeds 80 characters"],
      default: ""
    },
    followers: [
      {
        type: String,
        ref: "User",
        required: true,
      },
    ],
    followersCount: {
      type: Number,
      default: 0,
    },
    followings: [
      {
        type: String,
        ref: "User",
        required: true,
      },
    ],
    followingsCount: {
      type: Number,
      default: 0,
    },

    referals: [
      {
        user: {
          type: String,
          ref: "User",
          required: true,
        },
        referrerClaimed: {
          type: Boolean,
          default: false,
        },
        referralClaimed: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    referred: {
      type: String,
      ref: "User",
      default: null,
    },
    nftMinted: {
      type: Number,
      default: 0,
    },
    nftBought: {
      type: Number,
      default: 0,
    },
    nftSold: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

export default mongoose.models?.User || mongoose.model("User", userSchema);
