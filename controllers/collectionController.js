import User from "../models/user";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import SearchPagination from "../middleware/searchPagination";
import Collection from "../models/collection";

const allCollections = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 8;
  const collectionsCount = await Collection.countDocuments();

  const searchPagination = new SearchPagination(
    Collection.find().populate("createdBy"),
    req.query
  )
    .search("collections")
    .filter()
    .saved()
    .bids()
    .commented()
    .notin()
    .sorted()

  if(req.query.feed) {
    const user = await User.findById(req.query.feed)
    searchPagination.feed(user?.followings)
  }

  let collections = await searchPagination.query;

  let filteredCollectionsCount = collections.length;

  searchPagination.pagination(resultPerPage);

  collections = await searchPagination.query.clone();

  res.status(200).json({
    success: true,
    collections,
    collectionsCount,
    filteredCollectionsCount,
    resultPerPage,
  });
});

const getCollection = catchAsyncErrors(async (req, res) => {
  const collection = await Collection.findById(req.query.id)
    .populate("createdBy")

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
});

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
  let collection = await Collection.findById(req.query.id);

  if (!collection) {
    return res.status(404).json({
      success: false,
      error: "Collection not found with this ID",
    });
  }

  let pins;
  if (collection?.pins?.find((item) => item?.toString() === req.body.pinId)) {
    pins = collection?.pins?.filter((item) => item != req.body.pinId);
    collection.pins = pins;
  } else {
    collection.pins.unshift(req.body.pinId);
  }

  await collection.save({ validateBeforeSave: false });

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

  collection.savedCount = collection.saved.length

  await collection.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const getCommentsCollection = catchAsyncErrors(async (req, res) => {
  const collection = await Collection.findById(req.query.id)
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

  const newComment = {
    user,
    comment,
  };

  let collection = await Collection.findById(req.query.id).select("comments");

  if (!collection) {
    return res.status(404).json({
      success: false,
      error: "Collection not found with this ID",
    });
  }

  collection.comments.unshift(newComment);

  collection.commentsCount = collection.comments.length

  await collection.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const updateCollectionComment = catchAsyncErrors(async (req, res, next) => {
  const { commentId, user, comment } = req.body;

  let collection = await Collection.findById(req.query.id).select("comments");

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
  const { commentId, user } = req.body;

  let collection = await Collection.findById(req.query.id).select("comments");

  collection.comments = collection.comments.filter(
    (com) =>
      com?.user?.toString() !== user && com?._id?.toString() !== commentId
  );

  collection.commentsCount = collection.comments.length

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
