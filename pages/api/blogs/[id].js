import dbConnect from "../../../config/dbConnect"
import nc from "next-connect"
import { deleteBlog, getBlog, updateBlog } from "../../../controllers/blogController"

dbConnect()

const handler = nc()

handler.get(getBlog)

handler.put(updateBlog)

handler.delete(deleteBlog)

export default handler;