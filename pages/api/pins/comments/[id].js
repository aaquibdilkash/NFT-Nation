import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { commentPin, deletePinComment, updatePinComment } from "../../../../controllers/pinsController"

dbConnect()

const handler = nc()

handler.post(commentPin)

handler.put(updatePinComment)

handler.delete(deletePinComment)

export default handler;