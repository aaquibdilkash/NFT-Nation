import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { followUser } from "../../../../controllers/userController"

dbConnect()

const handler = nc()

handler.put(followUser)

export default handler;