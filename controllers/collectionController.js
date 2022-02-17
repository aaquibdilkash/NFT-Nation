import Pin from "../models/pin";
import User from "../models/user";
import Collection from "../models/collection";
import Message from "../models/message";
import Blog from "../models/blog";
import Notification from "../models/notification";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import SearchPagination from "../middleware/searchPagination";
// import redisClient from "./redis";
import mongoose from "mongoose";

// const DEFAULT_EXPIRATION = 3600;

const allCollections = catchAsyncErrors(async (req, res) => {
  // const redisClient = new Redis(process.env.REDIS_URL);
  
  // try {
  //   const data = await redisClient.get(req?.url);
    
  //   if (data) {
  //     return res.status(200).json(JSON.parse(data));
  //   }
  // } catch (e) {
  //   console.log(e);
  // }
  
  const resultPerPage = 8;
  const collectionsCount = await Collection.countDocuments();
  
  const searchPagination = new SearchPagination(
    Collection.find().populate("createdBy", "_id userName image").select("-pins"),
    req.query
    )
    .search("collections")
    .filter()
    .notin()
    .sorted();
        
  if (req.query.feed) {
    const user = await User.findById(req.query.feed);
    searchPagination.feed("collections", [...user?.followings, req.query.feed]);
  }

  let collections = await searchPagination.query;

  let filteredCollectionsCount = collections.length;

  searchPagination.pagination(resultPerPage);

  collections = await searchPagination.query.clone();

  res.status(200).json({
    success: true,
    data: collections,
    dataCount: collectionsCount,
    filteredDataCount: filteredCollectionsCount,
    resultPerPage,
  });

  // redisClient.set(
  //   req?.url,
  //   JSON.stringify({
  //     success: true,
  //     data: collections,
  //     dataCount: collectionsCount,
  //     filteredDataCount: filteredCollectionsCount,
  //     resultPerPage,
  //   }),
  //   "ex",
  //   DEFAULT_EXPIRATION
  // );

  // await redisClient.quit();
});

const getCollection = catchAsyncErrors(async (req, res) => {
  const collection = await Collection.findById(req.query.id).populate(
    "createdBy", "_id userName image"
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
  let collection = await Collection.findById(id).populate("pins", "postedBy price auctionEnded history");

  if (!collection) {
    return res.status(404).json({
      success: false,
      error: "Collection not found with this ID",
    });
  }

  collection.ownersCount = new Set(
    collection.pins.map((item) => item.postedBy._id.toString())
  ).size;
  // console.log(collection.ownersCount, "ownersCount good");

  collection.onSaleCount = collection.pins.filter(
    (item) => item.price != "0.0"
  ).length;
  // console.log(collection.onSaleCount, "onSaleCount good");

  collection.onAuctionCount = collection.pins.filter(
    (item) => !item.auctionEnded
  ).length;
  // console.log(collection.onAuctionCount, "onAuctionCount good");

  collection.volume = collection.pins.reduce((total, item) => {
    return (
      total +
      (item?.history && item?.history?.length > 0
        ? parseFloat(item?.history[0]?.price ?? "0.0")
        : parseFloat("0.0"))
    );
  }, 0);
  // console.log(collection.volume, "volume good");

  const prevVolume = collection.pins.reduce((total, item) => {
    return (
      total +
      (item?.history && item?.history?.length > 1
        ? parseFloat(item?.history[1]?.price ?? "0.0")
        : parseFloat("0.0"))
    );
  }, 0);
  // console.log(prevVolume, "preVolume good");

  collection.change = ((collection.volume - prevVolume) / prevVolume) * 100;
  // console.log(collection.change, "change good");

  collection = await collection.save({ validateBeforeSave: false });
};

const createCollection = catchAsyncErrors(async (req, res) => {
  let collection = await Collection.create(req.body);

  res.status(200).json({
    success: true,
    collection
  });

  // redisClient.flushall('ASYNC', () => {
  //   console.log("flused all keys in redis")
  // });

  // redisClient.del("/api/collections?page=1", () => {
  //   console.log("collections page 1 redis refreshed")
  // })
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
  }).populate("createdBy");

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

  // let pin = await Pin.findById(pinId).select("+pinCollection");
  let [pin, collection] = await Promise.all([await Pin.findById(pinId).select("+pinCollection"), await Collection.findById(collectionId)])

  if (!pin) {
    return res.status(404).json({
      success: false,
      error: "Pin not found with this ID",
    });
  }


  if (!(!pin?.pinCollection || pin?.pinCollection?.toString() === collectionId)) {
    return res.status(404).json({
      success: false,
      error: "Pin is already a part of another collection",
    });
  }

  // let collection = await Collection.findById(collectionId);

  if (!collection) {
    return res.status(404).json({
      success: false,
      error: "Collection not found with this ID",
    });
  }


  if (pin?.createdBy?.toString() !==  collection?.createdBy?.toString()) {
    return res.status(404).json({
      success: false,
      error: "You must be both the minter of the NFT and the creator of the collection",
    });
  }

  let pins;
  if (collection?.pins?.find((item) => item?.toString() === pinId)) {
    pins = collection?.pins?.filter((item) => item != pinId);
    collection.pins = pins;
    pin.pinCollection = null
  } else {
    collection.pins.unshift(pinId);
    pin.pinCollection = collectionId
  }


  collection.pinsCount = collection.pins.length;

  await Promise.all([collection.save({ validateBeforeSave: false }), pin.save({ validateBeforeSave: false })])
  // await collection.save({ validateBeforeSave: false });
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
    .populate("comments.user", "_id userName image");

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

const getCommentsCollectionReplies = catchAsyncErrors(async (req, res) => {
  const [collectionId, commentId] = req.query.id;

  const collection = await Collection.findById(collectionId)
  .select("comments")
  // .populate("comments.user", "_id userName image")
  .populate("comments.replies.user", "_id userName image")

  if (!collection) {
    return res.status(404).json({
      success: false,
      error: "Collection not found with this ID",
    });
  }
  
  const replies = collection.comments.find(
    (item) => item?._id?.toString() === commentId
    );

  res.status(200).json({
    success: true,
    comments: replies,
  });
});

const commentCollectionReply = catchAsyncErrors(async (req, res, next) => {
  const { user, comment } = req.body;
  const [collectionId, commentId] = req.query.id;

  const newComment = {
    user,
    comment,
  };

  let collection = await Collection.findById(collectionId).select("_id");

  if (!collection) {
    return res.status(404).json({
      success: false,
      error: "Collection not found with this ID",
    });
  }

  console.log(collection, "DDDDDDDDDDD")
  console.log(req.body, req.query.id)

  await Collection.updateOne(
    {
      _id: collectionId,
      "comments._id": commentId,
    },
    {
      $push: {
        "comments.$.replies": newComment,
      },
      $inc:{'comments.$.repliesCount':1}
    }
  );

  res.status(200).json({
    success: true,
  });
});

const updateCollectionCommentReply = catchAsyncErrors(async (req, res, next) => {
  const [collectionId, commentId, replyCommentId] = req.query.id;

  let collection = await Collection.findById(collectionId).select("_id");

  if (!collection) {
    return res.status(404).json({
      success: false,
      error: "Collection not found with this ID",
    });
  }

  await Collection.updateOne(
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

const deleteCollectionCommentReply = catchAsyncErrors(async (req, res, next) => {
  const [collectionId, commentId, replyCommentId] = req.query.id;

  let collection = await Collection.findById(collectionId).select("_id");

  if (!collection) {
    return res.status(404).json({
      success: false,
      error: "Collection not found with this ID",
    });
  }

  console.log(req.query.id, req.body, collection)

  await Collection.updateOne(
    {
      _id: collectionId,
      "comments._id": commentId,
    },
    {
      $pull: {
        "comments.$.replies": { _id: mongoose.Types.ObjectId(replyCommentId) },
      },
      $inc:{'comments.$.repliesCount':-1}
    }
  );

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
  getCommentsCollectionReplies,
  commentCollectionReply,
  updateCollectionCommentReply,
  deleteCollectionCommentReply,
};
