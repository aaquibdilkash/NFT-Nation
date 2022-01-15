import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { saveBlog } from "../../../../controllers/blogController"

dbConnect()

const handler = nc()

handler.put(saveBlog)

export default handler;