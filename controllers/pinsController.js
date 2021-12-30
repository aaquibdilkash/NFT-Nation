import Pin from "../models/pin";
import User from "../models/user";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import SearchPagination from "../middleware/searchPagination";

const allPins = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 20;
  const pinsCount = await Pin.countDocuments();

  const searchPagination = new SearchPagination(
    Pin.find().populate("postedBy"),
    req.query
  )
    .search()
    .filter()
    .saved();

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
  const pin = await Pin.findById(req.query.id).populate("postedBy").populate("comments.user");

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
    pin,
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
    pin,
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

  let saved
  if(pin?.saved?.find((item) => item.toString() === req.body.user)) {
    saved = pin?.saved?.filter((item) => item != req.body.user)
    pin.saved = saved
  } else {
    pin.saved.push(req.body.user)
  }

  await pin.save({validateBeforeSave: false})

  res.status(200).json({
      success: true,
      pin
  })
});

const commentPin = catchAsyncErrors(async (req, res, next) => {
    const { user, comment } = req.body;
  
    const newComment = {
      user,
      comment
    };
  
    const pin = await Pin.findById(req.query.id);
  
    const isReviewed = pin.comments.find(
      (com) => com.user.toString() === user
    );
  
    if (isReviewed) {
      pin.comments.forEach((com) => {
        if (com.user.toString() === user) {
            com.comment = comment
        }
      });
    } else {
      pin.comments.push(newComment);
    }
  
    await pin.save({ validateBeforeSave: false });
  
    res.status(200).json({
      success: true
    });
  });

export { allPins, getPin, createPin, updatePin, deletePin, savePin, commentPin };
