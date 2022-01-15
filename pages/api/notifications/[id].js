import dbConnect from "../../../config/dbConnect"
import nc from "next-connect"
import { deleteMessage, getMessage, updateMessage } from "../../../controllers/messageController"

dbConnect()

const handler = nc()

handler.get(getMessage)

handler.put(updateMessage)

handler.delete(deleteMessage)

export default handler;