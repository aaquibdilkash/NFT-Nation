import dbConnect from "../../../config/dbConnect"
import nc from "next-connect"
import { allBlogs, createBlog } from "../../../controllers/blogController"

dbConnect()

const handler = nc()

handler.get(allBlogs)
handler.post(createBlog)

export default handler;