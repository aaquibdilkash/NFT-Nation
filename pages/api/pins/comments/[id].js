import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { commentPin, deleteComment } from "../../../../controllers/pinsController"

dbConnect()

const handler = nc()

handler.post(commentPin)

handler.delete(deleteComment)

export default handler;