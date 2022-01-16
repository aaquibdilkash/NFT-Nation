import User from "../models/user";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import SearchPagination from "../middleware/searchPagination";

const allUsers = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 12;
  const usersCount = await User.countDocuments();

  const searchPagination = new SearchPagination(
    User.find(),
    req.query
  )
    // .search()
    // .filter()
    // .saved()
    // .bids();

  if (req.query.followers || req.query.followings) {
    if(req.query.followings) {
      let user = await User?.findById(req.query.followings)
      searchPagination.follow("followings", user?.followings);
    } else {
      let user = await User?.findById(req.query.followers)
      searchPagination.follow("followers", user?.followers);
    }
  }

  let users = await searchPagination.query;

  let filteredUsersCount = users.length;

  searchPagination.pagination(resultPerPage);

  users = await searchPagination.query.clone();

  res.status(200).json({
    success: true,
    users,
    usersCount,
    filteredUsersCount,
    resultPerPage,
  });
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
    let user = await User.findOne({address: req.body.address})

    if (!user) {
        user = await User.create(req.body);
    }
  
    res.status(200).json({
        success: true,
        user,
      });
    
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
          useFindAndModify: false
      })

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

      await user.remove()

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
  
    const alreadyFollowed = followee?.followers?.find((item) => item?.toString() === req.body.user)
    console.log(alreadyFollowed)

    if (alreadyFollowed) {
      followee.followers = followee?.followers?.filter((item) => item.toString() != req.body.user);
      follower.followings = follower?.followings?.filter((item) => item.toString() != req.query.id);
    } else {
      followee?.followers.unshift(req.body.user);
      follower?.followings.unshift(req.query.id);
    }
  
    await followee.save({ validateBeforeSave: false });
    await follower.save({ validateBeforeSave: false });
  
    res.status(200).json({
      success: true,
    });
  });

export { allUsers, getUser, createUser, updateUser, deleteUser, followUser };
