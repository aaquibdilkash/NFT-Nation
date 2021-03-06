import Pin from "../models/pin";
import Collection from "../models/collection";
import User from "../models/user";
import Message from "../models/message";
import Blog from "../models/blog";
import Notification from "../models/notification";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import SearchPagination from "../middleware/searchPagination";
// import redisClient from "./redis";
// import Redis from "ioredis"

// const DEFAULT_EXPIRATION = 3600;

const allUsers = catchAsyncErrors(async (req, res) => {
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
  const usersCount = await User.countDocuments();

  const searchPagination = new SearchPagination(User.find(), req.query)
    .search("user")
    .filter()
    .sorted();

  if (req.query.feed) {
    const user = await User.findById(req.query.feed);
    searchPagination.feed("users", user?.followings, user?.followers);
  }

  let users = await searchPagination.query;

  let filteredUsersCount = users.length;

  searchPagination.pagination(resultPerPage);

  users = await searchPagination.query.clone();

  res.status(200).json({
    success: true,
    data: users,
    dataCount: usersCount,
    filteredDataCount: filteredUsersCount,
    resultPerPage,
  });

  // redisClient.set(
  //   req?.url,
  //   JSON.stringify({
  //     success: true,
  //     data: users,
  //     dataCount: usersCount,
  //     filteredDataCount: filteredUsersCount,
  //     resultPerPage,
  //   }),
  //   "ex",
  //   DEFAULT_EXPIRATION
  // );

  // await redisClient.quit();
});

const getUser = catchAsyncErrors(async (req, res) => {
  const user = await User.findOne({userName: req.query.id});
  // const user = await User.findById(req.query.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found with this ID",
    });
  }
  res.status(200).json({
    success: true,
    user,
  });
});

const createUser = catchAsyncErrors(async (req, res) => {
  let user = await User.findById(req.body._id);

  if (!user) {
    user = await User.create(req.body);

    if (req.body.referred) {
      let referred = await User.findById(req.body.referred);
      referred.referrals = referred.referrals.push(referred);

      await referred.save({ validateBeforeSave: false });
    }
  }

  res.status(200).json({
    success: true,
    user,
  });

  // redisClient.flushall('ASYNC', () => {
  //   console.log("flused all keys in redis")
  // });

  // flushing old data
  // redisClient.del("/api/users?page=1", () => {
  //   console.log("users page 1 redis refreshed")
  // })
});

const updateUser = catchAsyncErrors(async (req, res) => {
  let user = await User.findById(req.query.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found with this ID",
    });
  }

  user = await User.findByIdAndUpdate(req.query.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

const updateUserData = catchAsyncErrors(async (req, res) => {
  let [userId1, userId2] = req.query.id;
  let [action1, action2] = req.body.actions;

  let user1 = await User.findById(userId1);
  let user2

  if (!user1) {
    return res.status(404).json({
      success: false,
      error: "User1 not found with this ID",
    });
  }

  user1[`${action1}`] += 1;
  await user1.save({ validateBeforeSave: false });

  if (userId2 && action2) {
    user2 = await User.findById(userId2);

    if (!user2) {
      return res.status(404).json({
        success: false,
        error: "User2 not found with this ID",
      });
    }

    user2[`${action2}`] += 1;
    await user2.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    success: true,
    user1
    // user2
  });
});

const deleteUser = catchAsyncErrors(async (req, res) => {
  let user = await User.findById(req.query.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found with this ID",
    });
  }

  await user.remove();

  res.status(200).json({
    success: true,
  });
});

const followUser = catchAsyncErrors(async (req, res) => {
  // let followee = await User.findById(req.query.id);
  // let follower = await User.findById(req.body.user);
  let [followee, follower] = await Promise.all([
    await User.findById(req.query.id),
    await User.findById(req.body.user),
  ]);

  if (!followee) {
    return res.status(404).json({
      success: false,
      error: "User not found with this ID",
    });
  }

  const alreadyFollowed = followee?.followers?.find(
    (item) => item?.toString() === req.body.user
  );

  if (alreadyFollowed) {
    followee.followers = followee?.followers?.filter(
      (item) => item.toString() != req.body.user
    );
    follower.followings = follower?.followings?.filter(
      (item) => item.toString() != req.query.id
    );
  } else {
    followee?.followers.unshift(req.body.user);
    follower?.followings.unshift(req.query.id);
  }

  followee.followersCount = followee.followers.length;
  follower.followingsCount = follower.followings.length;

  // await followee.save({ validateBeforeSave: false });
  // await follower.save({ validateBeforeSave: false });
  await Promise.all([
    followee.save({ validateBeforeSave: false }),
    follower.save({ validateBeforeSave: false }),
  ]);

  res.status(200).json({
    success: true,
  });
});

export { allUsers, getUser, createUser, updateUser, deleteUser, followUser, updateUserData };
