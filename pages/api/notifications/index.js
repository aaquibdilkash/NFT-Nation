import dbConnect from "../../../config/dbConnect"
import nc from "next-connect"
import { allMessages, createMessage } from "../../../controllers/messageController"

dbConnect()

const handler = nc()

handler.get(allMessages)

handler.post(createMessage)

export default handler;