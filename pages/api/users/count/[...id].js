import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { updateUserData } from "../../../../controllers/userController"

dbConnect()

const handler = nc()

handler.put(updateUserData)

export default handler;