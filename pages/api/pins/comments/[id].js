import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { commentPin, deletePinComment, getCommentsPin, updatePinComment } from "../../../../controllers/pinsController"

dbConnect()

const handler = nc()

handler.post(commentPin)

handler.get(getCommentsPin)

handler.put(updatePinComment)

handler.delete(deletePinComment)

export default handler;