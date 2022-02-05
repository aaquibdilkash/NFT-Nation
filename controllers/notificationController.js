import User from "../models/user";
import Notification from "../models/notification";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import SearchPagination from "../middleware/searchPagination";

const allNotifications = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 15;
  const notificationsCount = await Notification.countDocuments();

  
  const searchPagination = new SearchPagination(Notification.find().populate("byUser toUser pin pinCollection"), req.query).filter().sorted()
  // .search()
    
  let notifications = await searchPagination.query;

  let filteredNotificationsCount = notifications.length;

  searchPagination.pagination(resultPerPage);

  notifications = await searchPagination.query.clone();

  res.status(200).json({
    success: true,
    data: notifications,
    dataCount: notificationsCount,
    filteredDataCount: filteredNotificationsCount,
    resultPerPage,
  });
});

const getNotification = catchAsyncErrors(async (req, res) => {
  const notification = await Notification.findById(req.query.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: "Notification not found with this ID",
    });
  }
  res.status(200).json({
    success: true,
    notification,
  });
});

const createNotification = catchAsyncErrors(async (req, res) => {
  await Notification.create(req.body);

  res.status(200).json({
    success: true,
  });
});

const updateNotification = catchAsyncErrors(async (req, res) => {
  let notification = await Notification.findById(req.query.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: "Notification not found with this ID",
    });
  }

  notification = await Notification.findByIdAndUpdate(req.query.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

const deleteNotification = catchAsyncErrors(async (req, res) => {
  let notification = await Notification.findById(req.query.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: "Notification not found with this ID",
    });
  }

  await notification.remove();

  res.status(200).json({
    success: true,
  });
});

const markNotificationDeleted = catchAsyncErrors(async (req, res) => {
  const [userId, notificationId] = req.query.id;

  let notification = await Notification.findById(notificationId);

  console.log(userId, notificationId, notification?.to);

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: "Notification not found with this ID",
    });
  }

  notification.to = notification.to.filter(
    (item) => item.user.toString() !== userId
  );

  await notification.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const markAllNotificationsDeleted = catchAsyncErrors(async (req, res) => {
  const [userId] = req.query.id;
  let user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found with this ID",
    });
  }

  await Notification.updateMany(
    {
      "to.user": userId,
    },
    {
      $pull: {
        to: {
          user: userId,
        },
      },
    }
  );

  res.status(200).json({
    status: true,
  });
});

const markNotificationStatus = catchAsyncErrors(async (req, res) => {
  const [userId, notificationId] = req.query.id;
  const { status } = req.body;

  let notification = await Notification.findById(notificationId);

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: "Notification not found with this ID",
    });
  }

  notification.to.forEach((item) => {
    if (item.user.toString() === userId) {
      item.status = status;
    }
  });

  await notification.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const markAllNotificationStatus = catchAsyncErrors(async (req, res) => {
  const [userId] = req.query.id;
  let user = await User.findById(userId);
  const { status } = req.body;

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found with this ID",
    });
  }

  await Notification.updateMany(
    {},
    { $set: { "to.$[elem].status": status } },
    { arrayFilters: [{ "elem.user": userId }] }
  );

  res.status(200).json({
    status: true,
  });
});

export {
  allNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  markAllNotificationStatus,
  markNotificationStatus,
  markNotificationDeleted,
  markAllNotificationsDeleted,
};
