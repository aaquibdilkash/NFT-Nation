import dbConnect from "../../../../../config/dbConnect"
import nc from "next-connect"
import { commentPinReply, deletePinCommentReply, getCommentsPinReplies, updatePinCommentReply } from "../../../../../controllers/pinsController"

dbConnect()

const handler = nc()

handler.post(commentPinReply)

handler.get(getCommentsPinReplies)

handler.put(updatePinCommentReply)

handler.delete(deletePinCommentReply)

export default handler;