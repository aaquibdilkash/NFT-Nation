import User from "../models/user";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import SearchPagination from "../middleware/searchPagination";
import redisClient from "./redis";
// import Redis from "ioredis"

const DEFAULT_EXPIRATION = 3600;

const allUsers = catchAsyncErrors(async (req, res) => {
  // const redisClient = new Redis(process.env.REDIS_URL);

  try {
    const data = await redisClient.get(req?.url);

    if (data) {
      // return res.status(200).json(JSON.parse(data));
    }
  } catch (e) {
    console.log(e);
  }

  // redisClient.get(`users${JSON.stringify(req.query)}`, (err, data) => {
  //   if (err) {
  //     console.error(err);
  //   } else {
  //     if(data) {
  //       return res.status(200).json(JSON.parse(data));
  //     }
  //   }
  // });

  const resultPerPage = 8;
  const usersCount = await User.countDocuments();

  const searchPagination = new SearchPagination(User.find(), req.query)
    .search("user")
    .filter()
    .sorted();

  if(req.query.feed) {
    const user = await User.findById(req.query.feed)
    searchPagination.feed("users", user?.followings, user?.followers)
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

  redisClient.set(
    req?.url,
    JSON.stringify({
      success: true,
      data: users,
      dataCount: usersCount,
      filteredDataCount: filteredUsersCount,
      resultPerPage,
    }),
    "ex",
    DEFAULT_EXPIRATION
  );

  // await redisClient.quit();
});

const getUser = catchAsyncErrors(async (req, res) => {
  const user = await User.findById(req.query.id);

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
  let user = await User.findOne({ address: req.body.address });

  if (!user) {
    user = await User.create(req.body);
  }

  res.status(200).json({
    success: true,
    user,
  });

  // redisClient.flushall('ASYNC', () => {
  //   console.log("flused all keys in redis")
  // });

  // flushing old data
  redisClient.del("/api/users?page=1", () => {
    console.log("users page 1 redis refreshed")
  })
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
  let followee = await User.findById(req.query.id);
  let follower = await User.findById(req.body.user);

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

  await followee.save({ validateBeforeSave: false });
  await follower.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

export { allUsers, getUser, createUser, updateUser, deleteUser, followUser };
