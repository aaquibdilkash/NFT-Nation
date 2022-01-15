import Message from "../models/message";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import SearchPagination from "../middleware/searchPagination";

const allMessages = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 12;
  const messagesCount = await Message.countDocuments();

  const searchPagination = new SearchPagination(
    Message.find().populate("postedBy"),
    req.query
  )
    .search()
    .filter()
    .saved()
    .bids();

  let messages = await searchPagination.query;

  let filteredMessagesCount = messages.length;

  searchPagination.pagination(resultPerPage);

  messages = await searchPagination.query.clone();

  res.status(200).json({
    success: true,
    messages,
    messagesCount,
    filteredMessagesCount,
    resultPerPage,
  });
});

const getMessage = catchAsyncErrors(async (req, res) => {
  const message = await Message.findById(req.query.id);

  if (!message) {
    return res.status(404).json({
      success: false,
      error: "Message not found with this ID",
    });
  }
  res.status(200).json({
    success: true,
    message,
  });
});

const createMessage = catchAsyncErrors(async (req, res) => {
  await Message.create(req.body);

  res.status(200).json({
    success: true,
  });
});

const updateMessage = catchAsyncErrors(async (req, res) => {
  let message = await Message.findById(req.query.id);

  if (!message) {
    return res.status(404).json({
      success: false,
      error: "Message not found with this ID",
    });
  }

  message = await Message.findByIdAndUpdate(req.query.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

const deleteMessage = catchAsyncErrors(async (req, res) => {
  let message = await Message.findById(req.query.id);

  if (!message) {
    return res.status(404).json({
      success: false,
      error: "Message not found with this ID",
    });
  }

  await message.remove();

  res.status(200).json({
    success: true,
  });
});

export { allMessages, getMessage, createMessage, updateMessage, deleteMessage };
