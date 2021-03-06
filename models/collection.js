import mongoose from "mongoose";

const replyCommentSchema = new mongoose.Schema({
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
});

const commentSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: "User",
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  replies: {
    type: [replyCommentSchema],
    select: false
  },
  repliesCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const collectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter the title."],
    trim: true,
    maxlength: [42, "title field cannot exceeds 64 characters"],
  },
  about: {
    type: String,
    required: true,
    maxlength: [128, "about field cannot exceeds 128 characters"],
  },
  destination: {
    type: String,
    required: true,
    maxlength: [128, "destination field cannot exceeds 128 characters"],
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    ref: "User",
    required: true,
  },
  pins: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Pin",
      required: true,
    },
  ],
  pinsCount: {
    type: Number,
    default: 0
  },
  saved: [
    {
      type: String,
      ref: "User",
      required: true,
    },
  ],
  savedCount: {
    type: Number,
    default: 0
  },
  comments: { type: [commentSchema], select:false},
  commentsCount: {
    type: Number,
    default: 0
  },
  ownersCount: {
    type: Number,
    default: 0
  },
  onSaleCount: {
    type: Number,
    default: 0
  },
  onAuctionCount: {
    type: Number,
    default: 0
  },
  volume: {
    type: Number,
    default: 0
  },
  change: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models?.Collection || mongoose.model("Collection", collectionSchema);
