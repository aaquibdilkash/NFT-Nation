import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    default: null
  },
  to: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      status: {
        type: String,
        default: "unread",
      },
    },
  ],
  byUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    default: null,
  },
  toUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    default: null,
  },
  pin: {
    type: mongoose.Schema.ObjectId,
    ref: "Pin",
    default: null,
  },
  pinCollection: {
    type: mongoose.Schema.ObjectId,
    ref: "Collection",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '7d'
  },
});

export default mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
