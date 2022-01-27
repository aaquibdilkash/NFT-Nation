import Pin from "../models/pin";
import User from "../models/user";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import SearchPagination from "../middleware/searchPagination";
import Collection from "../models/collection";
import redisClient from "./redis";

const DEFAULT_EXPIRATION = 3600;

const allPins = catchAsyncErrors(async (req, res) => {
  const data = await redisClient.get(`pins${JSON.stringify(req.query)}`);

  if (data) {
    return res.status(200).json(JSON.parse(data));
  }

  const resultPerPage = 8;
  const pinsCount = await Pin.countDocuments();

  const searchPagination = new SearchPagination(
    Pin.find().populate("postedBy").populate("createdBy"),
    req.query
  )
    .search("pins")
    .filter()
    .saved()
    .bids()
    .commented()
    .notin()
    .sorted();

  if ((req.query.feed, "pins")) {
    const user = await User.findById(req.query.feed);
    searchPagination.feed(user?.followings);
  }

  if (req.query.collection) {
    const collection = await Collection.findById(req.query.collection);
    searchPagination.collection(collection?.pins);
  }

  let pins = await searchPagination.query;

  let filteredPinsCount = pins.length;

  searchPagination.pagination(resultPerPage);

  pins = await searchPagination.query.clone();

  redisClient.set(
    `pins${JSON.stringify(req.query)}`,
    JSON.stringify({
      success: true,
      pins,
      pinsCount,
      filteredPinsCount,
      resultPerPage,
    }),
    "ex",
    DEFAULT_EXPIRATION,
  );

  res.status(200).json({
    success: true,
    pins,
    pinsCount,
    filteredPinsCount,
    resultPerPage,
  });
});

const getPin = catchAsyncErrors(async (req, res) => {
  const pin = await Pin.findById(req.query.id)
    .populate("postedBy")
    .populate("createdBy")
    .populate("bids.user");

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

const createPin = catchAsyncErrors(async (req, res) => {
  const pin = await Pin.create(req.body);

  res.status(200).json({
    success: true,
  });
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
  let pin = await Pin.findById(req.query.id);

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
    .populate("comments.user");

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

  let pin = await Pin.findById(pinId);

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

const saveHistoryPin = catchAsyncErrors(async (req, res, next) => {
  let pin = await Pin.findById(req.query.id);

  pin.history.unshift(req.body);

  pin = await pin.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const getHistoryPin = catchAsyncErrors(async (req, res) => {
  const pin = await Pin.findById(req.query.id)
    .select("history")
    .populate("history.user");

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

const makeAuctionBid = catchAsyncErrors(async (req, res, next) => {
  const { user, bid } = req.body;

  const newBid = {
    user,
    bid,
  };

  let pin = await Pin.findById(req.query.id);

  const alreadyBid = pin.bids.find((bid) => bid.user.toString() === user);

  if (alreadyBid) {
    res.status(403).json({
      success: false,
      message: "You already have an existing bid for this item",
    });
  } else {
    pin.bids.unshift(newBid);

    pin = await pin.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
    });
  }
});

const withdrawAuctionBid = catchAsyncErrors(async (req, res, next) => {
  const { user } = req.body;

  let pin = await Pin.findById(req.query.id);

  const alreadyBid = pin.bids.find((bid) => bid.user.toString() === user);

  if (!alreadyBid) {
    res.status(403).json({
      success: false,
      message: "You don't have any existing bid for this item",
    });
  } else {
    pin.bids = pin.bids.filter((bid) => bid?.user?.toString() !== user);

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
  saveHistoryPin,
  getHistoryPin,
  getCommentsPin,
  commentPin,
  updatePinComment,
  deletePinComment,
  makeAuctionBid,
  withdrawAuctionBid,
};
