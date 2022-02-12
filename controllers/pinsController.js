import Pin from "../models/pin";
import Collection from "../models/collection";
import User from "../models/user";
import Message from "../models/message";
import Blog from "../models/blog";
import Notification from "../models/notification";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import SearchPagination from "../middleware/searchPagination";
// import redisClient from "./redis";
import { getMaxBid } from "../utils/data";
import mongoose from "mongoose";

// const DEFAULT_EXPIRATION = 3600;

const allPins = catchAsyncErrors(async (req, res) => {
  // try {
  //   const data = await redisClient.get(req?.url);

  //   if (data) {
  //     return res.status(200).json(JSON.parse(data));
  //   }
  // } catch (e) {
  //   console.log(e);
  // }

  const resultPerPage = 8;
  const pinsCount = await Pin.countDocuments();

  const searchPagination = new SearchPagination(
    Pin.find().populate("postedBy", "_id userName image"),
    req.query
  )
    .search("pins")
    .filter()
    .notin()
    .sorted();

  if (req.query.feed) {
    const user = await User.findById(req.query.feed);
    searchPagination.feed("pins", [...user?.followings, req.query.feed]);
  }

  let pins = await searchPagination.query;

  let filteredPinsCount = pins.length;

  searchPagination.pagination(resultPerPage);

  pins = await searchPagination.query.clone();

  res.status(200).json({
    success: true,
    data: pins,
    dataCount: pinsCount,
    filteredDataCount: filteredPinsCount,
    resultPerPage,
  });

  // redisClient.set(
  //   req?.url,
  //   JSON.stringify({
  //     success: true,
  //     data: pins,
  //     dataCount: pinsCount,
  //     filteredDataCount: filteredPinsCount,
  //     resultPerPage,
  //   }),
  //   "ex",
  //   DEFAULT_EXPIRATION
  // );

  // await redisClient.quit();
});

const getPin = catchAsyncErrors(async (req, res) => {
  const pin = await Pin.findById(req.query.id)
    .populate("postedBy", "_id userName image")
    .populate("createdBy", "_id userName image");

  if (!pin) {
    return res.status(404).json({
      success: false,
      error: "Pin not found with this ID",
    });
  }
  res.status(200).json({
    success: true,
    pin,
  });
});


const isPinExist = catchAsyncErrors(async (req, res) => {
  const { nftContract, tokenId } = req.body;

  const pin = await Pin.findOne({ nftContract, tokenId });

  if (pin) {
    return res.status(404).json({
      success: false,
      error: "Pin Already Exist!",
    });
  }
  res.status(200).json({
    success: true,
  });
});

const createPin = catchAsyncErrors(async (req, res) => {
  let pin = await Pin.create(req.body);

  res.status(200).json({
    success: true,
    pin,
  });

  // redisClient.flushall('ASYNC', () => {
  //   console.log("flused all keys in redis")
  // });

  // redisClient.del("/api/pins?page=1", () => {
  //   console.log("pins page 1 redis refreshed");
  // });
});

const updatePin = catchAsyncErrors(async (req, res) => {
  let pin = await Pin.findById(req.query.id);

  if (!pin) {
    return res.status(404).json({
      success: false,
      error: "Pin not found with this ID",
    });
  }

  pin = await Pin.findByIdAndUpdate(req.query.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

const deletePin = catchAsyncErrors(async (req, res) => {
  let pin = await Pin.findById(req.query.id);

  if (!pin) {
    return res.status(404).json({
      success: false,
      error: "Pin not found with this ID",
    });
  }

  await pin.remove();

  res.status(200).json({
    success: true,
  });
});

const savePin = catchAsyncErrors(async (req, res) => {
  let pin = await Pin.findById(req.query.id).select("saved");

  if (!pin) {
    return res.status(404).json({
      success: false,
      error: "Pin not found with this ID",
    });
  }

  let saved;
  if (pin?.saved?.find((item) => item?.toString() === req.body.user)) {
    saved = pin?.saved?.filter((item) => item != req.body.user);
    pin.saved = saved;
  } else {
    pin.saved.unshift(req.body.user);
  }

  pin.savedCount = pin.saved.length;
  await pin.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const getCommentsPin = catchAsyncErrors(async (req, res) => {
  const [pinId] = req.query.id;

  const pin = await Pin.findById(pinId)
    .select("comments")
    .populate("comments.user", "_id userName image");

  if (!pin) {
    return res.status(404).json({
      success: false,
      error: "Pin not found with this ID",
    });
  }
  res.status(200).json({
    success: true,
    comments: pin.comments,
  });
});

const commentPin = catchAsyncErrors(async (req, res, next) => {
  const { user, comment } = req.body;
  const [pinId] = req.query.id;

  const newComment = {
    user,
    comment,
  };

  let pin = await Pin.findById(pinId).select("comments");

  if (!pin) {
    return res.status(404).json({
      success: false,
      error: "Pin not found with this ID",
    });
  }

  pin.comments.unshift(newComment);
  pin.commentsCount = pin.comments.length;

  await pin.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const updatePinComment = catchAsyncErrors(async (req, res, next) => {
  const { user, comment } = req.body;
  const [pinId, commentId] = req.query.id;

  let pin = await Pin.findById(pinId).select("comments");

  if (!pin) {
    return res.status(404).json({
      success: false,
      error: "Pin not found with this ID",
    });
  }

  pin.comments.forEach((com) => {
    if (com.user.toString() === user && com._id.toString() === commentId) {
      com.comment = comment;
    }
  });

  await pin.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const deletePinComment = catchAsyncErrors(async (req, res, next) => {
  const [pinId, commentId] = req.query.id;
  let pin = await Pin.findById(pinId).select("comments");

  if (!pin) {
    return res.status(404).json({
      success: false,
      error: "Pin not found with this ID",
    });
  }

  pin.comments = pin.comments.filter(
    (com) => com?._id?.toString() !== commentId
  );

  pin.commentsCount = pin.comments.length;

  pin = await pin.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const getCommentsPinReplies = catchAsyncErrors(async (req, res) => {
  const [pinId, commentId] = req.query.id;

  // console.log(req.query.id)

  const pin = await Pin.findById(pinId)
    .select("comments")
    // .populate("comments.user", "_id userName image")
    .populate("comments.replies.user", "_id userName image");

  if (!pin) {
    return res.status(404).json({
      success: false,
      error: "Pin not found with this ID",
    });
  }

  const replies = pin.comments.find(
    (item) => item?._id?.toString() === commentId
  ).replies;

  res.status(200).json({
    success: true,
    comments: replies,
  });
});

const commentPinReply = catchAsyncErrors(async (req, res, next) => {
  const { user, comment } = req.body;
  const [pinId, commentId] = req.query.id;

  const newComment = {
    user,
    comment,
  };

  let pin = await Pin.findById(pinId).select("_id");

  if (!pin) {
    return res.status(404).json({
      success: false,
      error: "Pin not found with this ID",
    });
  }

  await Pin.updateOne(
    {
      _id: pinId,
      "comments._id": commentId,
    },
    {
      $push: {
        "comments.$.replies": newComment,
      },
    }
  );

  // pin.comments.replies.push(newComment);
  // pin.comments.repliesCount = pin.comments.replies.length;

  // await pin.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const updatePinCommentReply = catchAsyncErrors(async (req, res, next) => {
  const { user, comment } = req.body;
  const [pinId, commentId, replyCommentId] = req.query.id;

  let pin = await Pin.findById(pinId).select("comments");

  if (!pin) {
    return res.status(404).json({
      success: false,
      error: "Pin not found with this ID",
    });
  }

  pin.comments.forEach((com) => {
    if (com.user.toString() === user && com._id.toString() === replyCommentId) {
      com.comment = comment;
    }
  });

  await pin.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const deletePinCommentReply = catchAsyncErrors(async (req, res, next) => {
  const [pinId, commentId, replyCommentId] = req.query.id;
  let pin = await Pin.findById(pinId).select("_id");

  if (!pin) {
    return res.status(404).json({
      success: false,
      error: "Pin not found with this ID",
    });
  }

  await Pin.updateOne(
    {
      _id: pinId,
      "comments._id": commentId,
    },
    {
      $pull: {
        "comments.$.replies": { _id: mongoose.Types.ObjectId(replyCommentId) },
      },
    }
  );

  res.status(200).json({
    success: true,
  });
});

const saveHistoryPin = catchAsyncErrors(async (req, res, next) => {
  let pin = await Pin.findById(req.query.id).select("history");

  pin.history.unshift(req.body);

  pin = await pin.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const getHistoryPin = catchAsyncErrors(async (req, res) => {
  const pin = await Pin.findById(req.query.id)
    .select("history")
    .populate("history.user", "_id userName image");

  if (!pin) {
    return res.status(404).json({
      success: false,
      error: "Pin not found with this ID",
    });
  }
  res.status(200).json({
    success: true,
    history: pin.history,
  });
});

const getPropertyPin = catchAsyncErrors(async (req, res) => {
  const pin = await Pin.findById(req.query.id).select("attributes");

  if (!pin) {
    return res.status(404).json({
      success: false,
      error: "Pin not found with this ID",
    });
  }
  res.status(200).json({
    success: true,
    attributes: pin.attributes,
  });
});

const getBidsPin = catchAsyncErrors(async (req, res) => {
  const pin = await Pin.findById(req.query.id)
    .select("bids")
    .populate("bids.user", "_id userName image");

  if (!pin) {
    return res.status(404).json({
      success: false,
      error: "Pin not found with this ID",
    });
  }
  res.status(200).json({
    success: true,
    bids: pin.bids,
  });
});

const makeAuctionBid = catchAsyncErrors(async (req, res, next) => {
  const { user, bid } = req.body;

  const newBid = {
    user,
    bid,
  };

  let pin = await Pin.findById(req.query.id).select("bids");

  const alreadyBid = pin.bids.find((bid) => bid.user.toString() === user);

  if (alreadyBid) {
    res.status(403).json({
      success: false,
      message: "You already have an existing bid for this item",
    });
  } else {
    pin.bids.unshift(newBid);
    pin.currentBid = getMaxBid(pin.bids).bid;
    pin.bidsCount = pin.bids.length;
    pin = await pin.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
    });
  }
});

const withdrawAuctionBid = catchAsyncErrors(async (req, res, next) => {
  const { user } = req.body;

  let pin = await Pin.findById(req.query.id).select("bids");

  const alreadyBid = pin.bids.find((bid) => bid.user.toString() === user);

  if (!alreadyBid) {
    res.status(403).json({
      success: false,
      message: "You don't have any existing bid for this item",
    });
  } else {
    pin.bids = pin.bids.filter((bid) => bid?.user?.toString() !== user);
    pin.currentBid = getMaxBid(pin.bids).bid;
    pin.bidsCount = pin.bids.length;
    pin = await pin.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
    });
  }
});

const getOffersPin = catchAsyncErrors(async (req, res) => {
  const pin = await Pin.findById(req.query.id)
    .select("offers")
    .populate("offers.user", "_id userName image");

  if (!pin) {
    return res.status(404).json({
      success: false,
      error: "Pin not found with this ID",
    });
  }
  res.status(200).json({
    success: true,
    offers: pin.offers,
  });
});

const makeOffer = catchAsyncErrors(async (req, res, next) => {
  const { user, offer } = req.body;

  const newOffer = {
    user,
    offer,
  };

  let pin = await Pin.findById(req.query.id).select("offers");

  const alreadyOffer = pin.offers.find(
    (offer) => offer.user.toString() === user
  );

  if (alreadyOffer) {
    res.status(403).json({
      success: false,
      message: "You already have an existing offer for this item",
    });
  } else {
    pin.offers.unshift(newOffer);
    pin.offersCount = pin.offers.length;

    pin = await pin.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
    });
  }
});

const withdrawOffer = catchAsyncErrors(async (req, res, next) => {
  const { user } = req.body;

  let pin = await Pin.findById(req.query.id).select("offers");

  const alreadyOffer = pin.offers.find(
    (offer) => offer.user.toString() === user
  );

  if (!alreadyOffer) {
    res.status(403).json({
      success: false,
      message: "You don't have any existing offer for this item",
    });
  } else {
    pin.offers = pin.offers.filter((offer) => offer?.user?.toString() !== user);
    pin.bidsCount = pin.offers.length;
    pin = await pin.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
    });
  }
});

export {
  allPins,
  getPin,
  createPin,
  updatePin,
  deletePin,
  savePin,
  getCommentsPin,
  commentPin,
  updatePinComment,
  deletePinComment,
  getCommentsPinReplies,
  commentPinReply,
  updatePinCommentReply,
  deletePinCommentReply,
  saveHistoryPin,
  getHistoryPin,
  getPropertyPin,
  getBidsPin,
  makeAuctionBid,
  withdrawAuctionBid,
  getOffersPin,
  makeOffer,
  withdrawOffer,
  isPinExist,
};
