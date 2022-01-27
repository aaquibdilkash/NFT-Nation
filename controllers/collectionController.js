import User from "../models/user";
import Pin from "../models/pin";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import SearchPagination from "../middleware/searchPagination";
import Collection from "../models/collection";
import redisClient from "./redis";

const DEFAULT_EXPIRATION = 3600;

const allCollections = catchAsyncErrors(async (req, res) => {
  const data = await redisClient.get(`collections${JSON.stringify(req.query)}`);

  if (data) {
    return res.status(200).json(JSON.parse(data));
  }

  const resultPerPage = 8;
  const collectionsCount = await Collection.countDocuments();

  const searchPagination = new SearchPagination(
    Collection.find().populate("createdBy").select("-pins"),
    req.query
  )
    .search("collections")
    .filter()
    .saved()
    .bids()
    .commented()
    .notin()
    .sorted();

  if ((req.query.feed, "collections")) {
    const user = await User.findById(req.query.feed);
    searchPagination.feed(user?.followings);
  }

  let collections = await searchPagination.query;

  let filteredCollectionsCount = collections.length;

  searchPagination.pagination(resultPerPage);

  collections = await searchPagination.query.clone();

  redisClient.set(
    `collections${JSON.stringify(req.query)}`,
    JSON.stringify({
      success: true,
      collections,
      collectionsCount,
      filteredCollectionsCount,
      resultPerPage,
    }),
    "ex",
    DEFAULT_EXPIRATION,
  );

  res.status(200).json({
    success: true,
    collections,
    collectionsCount,
    filteredCollectionsCount,
    resultPerPage,
  });
});

const getCollection = catchAsyncErrors(async (req, res) => {
  const collection = await Collection.findById(req.query.id).populate(
    "createdBy"
  );

  if (!collection) {
    return res.status(404).json({
      success: false,
      error: "Collection not found with this ID",
    });
  }
  res.status(200).json({
    success: true,
    collection,
  });

  try {
    updateCollectionData(req.query.id);
  } catch (e) {
    return;
  }
});

const updateCollectionData = async (id) => {
  let collection = await Collection.findById(id).populate("pins");

  if (!collection) {
    return res.status(404).json({
      success: false,
      error: "Collection not found with this ID",
    });
  }

  collection.ownersCount = new Set(
    collection.pins.map((item) => item.postedBy._id.toString())
  ).size;
  console.log(collection.ownersCount, "ownersCount good");

  collection.onSaleCount = collection.pins.filter(
    (item) => item.price != "0.0"
  ).length;
  console.log(collection.onSaleCount, "onSaleCount good");

  collection.onAuctionCount = collection.pins.filter(
    (item) => !item.auctionEnded
  ).length;
  console.log(collection.onAuctionCount, "onAuctionCount good");

  collection.volume = collection.pins.reduce((a, b) => ({
    price:
      parseFloat(a?.history[0]?.price ?? "0.0") +
      parseFloat(b?.history[0]?.price ?? "0.0"),
  })).price;
  console.log(collection.volume, "volume good");

  const prevVolume = collection.pins.reduce((a, b) => ({
    price:
      parseFloat(a?.history[1]?.price ?? "0.0") +
      parseFloat(b?.history[1]?.price ?? "0.0"),
  })).price;
  console.log(prevVolume, "preVolume good");

  collection.change = ((collection.volume - prevVolume) / prevVolume) * 100;
  console.log(collection.change, "change good");

  collection = await collection.save({ validateBeforeSave: false });
};

const createCollection = catchAsyncErrors(async (req, res) => {
  await Collection.create(req.body);

  res.status(200).json({
    success: true,
  });
});

const updateCollection = catchAsyncErrors(async (req, res) => {
  let collection = await Collection.findById(req.query.id);

  if (!collection) {
    return res.status(404).json({
      success: false,
      error: "Collection not found with this ID",
    });
  }

  collection = await Collection.findByIdAndUpdate(req.query.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    collection,
  });
});

const deleteCollection = catchAsyncErrors(async (req, res) => {
  let collection = await Collection.findById(req.query.id);

  if (!collection) {
    return res.status(404).json({
      success: false,
      error: "Collection not found with this ID",
    });
  }

  await collection.remove();

  res.status(200).json({
    success: true,
  });
});

const addPinToCollection = catchAsyncErrors(async (req, res) => {
  const [collectionId, pinId] = req.query.id;

  let pin = await Pin.findById(pinId);

  if (!pin) {
    return res.status(404).json({
      success: false,
      error: "Pin not found with this ID",
    });
  }

  // if (pin.pinCollection) {
  //   return res.status(404).json({
  //     success: false,
  //     error: "Pin is already a part of another collection",
  //   });
  // }

  let collection = await Collection.findById(collectionId);

  if (!collection) {
    return res.status(404).json({
      success: false,
      error: "Collection not found with this ID",
    });
  }

  let pins;
  if (collection?.pins?.find((item) => item?.toString() === pinId)) {
    pins = collection?.pins?.filter((item) => item != pinId);
    collection.pins = pins;
    // pin.pinCollection = null
  } else {
    collection.pins.unshift(pinId);
    // pin.pinCollection = collectionId
  }

  collection.pinsCount = collection.pins.length;

  await collection.save({ validateBeforeSave: false });
  // await pin.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const saveCollection = catchAsyncErrors(async (req, res) => {
  let collection = await Collection.findById(req.query.id);

  if (!collection) {
    return res.status(404).json({
      success: false,
      error: "Collection not found with this ID",
    });
  }

  let saved;
  if (collection?.saved?.find((item) => item?.toString() === req.body.user)) {
    saved = collection?.saved?.filter((item) => item != req.body.user);
    collection.saved = saved;
  } else {
    collection.saved.unshift(req.body.user);
  }

  collection.savedCount = collection.saved.length;

  await collection.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const getCommentsCollection = catchAsyncErrors(async (req, res) => {
  const [pinId] = req.query.id;

  const collection = await Collection.findById(pinId)
    .select("comments")
    .populate("comments.user");

  if (!collection) {
    return res.status(404).json({
      success: false,
      error: "Pin not found with this ID",
    });
  }
  res.status(200).json({
    success: true,
    comments: collection.comments,
  });
});

const commentCollection = catchAsyncErrors(async (req, res, next) => {
  const { user, comment } = req.body;
  const [collectionId] = req.query.id;

  const newComment = {
    user,
    comment,
  };

  let collection = await Collection.findById(collectionId).select("comments");

  if (!collection) {
    return res.status(404).json({
      success: false,
      error: "Collection not found with this ID",
    });
  }

  collection.comments.unshift(newComment);

  collection.commentsCount = collection.comments.length;

  await collection.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const updateCollectionComment = catchAsyncErrors(async (req, res, next) => {
  const { user, comment } = req.body;
  const [collectionId, commentId] = req.query.id;

  let collection = await Collection.findById(collectionId).select("comments");

  if (!collection) {
    return res.status(404).json({
      success: false,
      error: "Collection not found with this ID",
    });
  }

  collection.comments.forEach((com) => {
    if (com.user.toString() === user && com._id.toString() === commentId) {
      com.comment = comment;
    }
  });

  await collection.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const deleteCollectionComment = catchAsyncErrors(async (req, res, next) => {
  const [collectionId, commentId] = req.query.id;

  let collection = await Collection.findById(collectionId).select("comments");

  if (!collection) {
    return res.status(404).json({
      success: false,
      error: "Collection not found with this ID",
    });
  }

  collection.comments = collection.comments.filter(
    (com) => com?._id?.toString() !== commentId
  );

  collection.commentsCount = collection.comments.length;

  collection = await collection.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

export {
  allCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
  addPinToCollection,
  saveCollection,
  getCommentsCollection,
  commentCollection,
  updateCollectionComment,
  deleteCollectionComment,
};
