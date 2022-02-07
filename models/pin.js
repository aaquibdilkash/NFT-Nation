import mongoose from "mongoose";

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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const historySchema = new mongoose.Schema({
  user: {
    type: String,
    ref: "User",
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const bidSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: "User",
    required: true,
  },
  bid: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const offerSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: "User",
    required: true,
  },
  offer: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const attributesSchema = new mongoose.Schema({
  trait_type: {
    type: String,
    default: ""
  },
  display_type: {
    type: String,
    default: ""
  },
  value: {
    type: String,
    default: ""
  },
});

const pinSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: [true, "Please enter the item id."],
  },
  nftContract: {
    type: String,
    required: [true, "Please enter the nft contract address."],
  },
  tokenId: {
    type: String,
    required: [true, "Please enter the tokenId."],
  },
  price: {
    type: String,
    default: "0.0",
    trim: true,
  },
  currentBid: {
    type: String,
    default: "0.0",
    trim: true,
  },
  startingBid: {
    type: String,
    default: "0.0",
    trim: true,
  },
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
  postedBy: {
    type: String,
    ref: "User",
    required: true,
  },
  createdBy: {
    type: String,
    ref: "User",
    required: true,
  },
  pinCollection: {
    type: mongoose.Schema.ObjectId,
    ref: "Collection",
    default: null,
    select: false
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
  auctionEnded: {
    type: Boolean,
    default: true,
  },
  onSale: {
    type: Boolean,
    default: false,
  },
  bids: {
    type: [bidSchema],
    select: false
  },
  bidsCount: {
    type: Number,
    default: 0
  },
  offers: {
    type: [offerSchema],
    select: false
  },
  offersCount: {
    type: Number,
    default: 0
  },
  history: {
    type: [historySchema],
    select: false
  },
  attributes: {
    type: [attributesSchema],
    select: false
  },
  comments: { type: [commentSchema], select:false},
  commentsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Pin || mongoose.model("Pin", pinSchema);
