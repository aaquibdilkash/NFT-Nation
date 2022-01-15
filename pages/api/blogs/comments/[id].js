import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { commentBlog, deleteBlogComment, updateBlogComment } from "../../../../controllers/blogController"

dbConnect()

const handler = nc()

handler.post(commentBlog)

handler.put(updateBlogComment)

handler.delete(deleteBlogComment)

export default handler;