import Pin from "../models/pin";
import User from "../models/user";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import SearchPagination from "../middleware/searchPagination";
import Collection from "../models/collection";

const allPins = catchAsyncErrors(async (req, res) => {
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

  if (req.query.feed, "pins") {
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

  res.status(200).json({
    success: true,
    pins,
    pinsCount,
    filteredPinsCount,
    resultPerPage,
  });
});

const getPin = catchAsyncErrors(async (req, res) => {
  const pin = await Pin.findById(req.query.id).populate("postedBy").populate("createdBy").populate("bids.user");

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
  const pin = await Pin.findById(req.query.id)
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
  console.log("in comment pin", req.body);
  const { user, comment } = req.body;

  const newComment = {
    user,
    comment,
  };

  let pin = await Pin.findById(req.query.id).select("comments");

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
  const { commentId, user, comment } = req.body;

  let pin = await Pin.findById(req.query.id);

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
  const { commentId, user } = req.body;

  let pin = await Pin.findById(req.query.id);

  pin.comments = pin.comments.filter(
    (com) =>
      com?.user?.toString() !== user && com?._id?.toString() !== commentId
  );

  pin.commentsCount = pin.comments.length;

  pin = await pin.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
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
  getCommentsPin,
  commentPin,
  updatePinComment,
  deletePinComment,
  makeAuctionBid,
  withdrawAuctionBid,
};
