import Blog from "../models/blog";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import SearchPagination from "../middleware/searchPagination";

const allBlogs = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 12;
  const blogsCount = await Blog.countDocuments();

  const searchPagination = new SearchPagination(
    Blog.find().populate("postedBy"),
    req.query
  )
    .search()
    .filter()
    .saved()
    .bids();

  let blogs = await searchPagination.query;

  let filteredBlogsCount = blogs.length;

  searchPagination.pagination(resultPerPage);

  blogs = await searchPagination.query.clone();

  res.status(200).json({
    success: true,
    blogs,
    blogsCount,
    filteredBlogsCount,
    resultPerPage,
  });
});

const getBlog = catchAsyncErrors(async (req, res) => {
  const blog = await Blog.findById(req.query.id)
    .populate("postedBy")
    .populate("comments.user");

  if (!blog) {
    return res.status(404).json({
      success: false,
      error: "Blog not found with this ID",
    });
  }
  res.status(200).json({
    success: true,
    blog,
  });
});

const createBlog = catchAsyncErrors(async (req, res) => {
  await Blog.create(req.body);

  res.status(200).json({
    success: true,
  });
});

const updateBlog = catchAsyncErrors(async (req, res) => {
  let blog = await Blog.findById(req.query.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      error: "Blog not found with this ID",
    });
  }

  blog = await Blog.findByIdAndUpdate(req.query.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

const deleteBlog = catchAsyncErrors(async (req, res) => {
  let blog = await Blog.findById(req.query.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      error: "Blog not found with this ID",
    });
  }

  await blog.remove();

  res.status(200).json({
    success: true,
  });
});

const saveBlog = catchAsyncErrors(async (req, res) => {
  let blog = await Blog.findById(req.query.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      error: "Blog not found with this ID",
    });
  }

  let saved;
  if (blog?.saved?.find((item) => item?.toString() === req.body.user)) {
    saved = blog?.saved?.filter((item) => item != req.body.user);
    blog.saved = saved;
  } else {
    blog.saved.unshift(req.body.user);
  }

  await blog.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const commentBlog = catchAsyncErrors(async (req, res, next) => {
  const { user, comment } = req.body;

  const newComment = {
    user,
    comment,
  };

  let blog = await Blog.findById(req.query.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      error: "Blog not found with this ID",
    });
  }

  blog.comments.unshift(newComment);

  await blog.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const updateBlogComment = catchAsyncErrors(async (req, res, next) => {
  const { commentId, user, comment } = req.body;

  let blog = await Blog.findById(req.query.id);

  blog.comments.forEach((com) => {
    if (com.user.toString() === user && com?._id?.toString() === commentId) {
      com.comment = comment;
    }
  });

  await blog.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const deleteBlogComment = catchAsyncErrors(async (req, res, next) => {
  const {commentId, user } = req.body;

  let blog = await Blog.findById(req.query.id);

    blog.comments = blog.comments.filter(
      (com) => com?.user?.toString() !== user && com?._id?.toString() !== commentId
    );

    blog = await blog.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
    });
});

export {
  allBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  saveBlog,
  commentBlog,
  updateBlogComment,
  deleteBlogComment,
};
