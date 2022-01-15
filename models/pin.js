import mongoose from "mongoose";

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
    required: [true, "Please enter the price."],
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
    maxlength: [80, "about field cannot exceeds 128 characters"],
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
  seller: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  postedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  saved: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  auctionEnded: {
    type: Boolean,
    default: true
  },
  bids: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      bid: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Pin || mongoose.model("Pin", pinSchema);
