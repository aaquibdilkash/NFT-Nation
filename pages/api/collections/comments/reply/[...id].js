import dbConnect from "../../../../../config/dbConnect"
import nc from "next-connect"
import { commentCollectionReply, deleteCollectionCommentReply, getCommentsCollectionReplies, updateCollectionCommentReply } from "../../../../../controllers/collectionController"

dbConnect()

const handler = nc()

handler.get(getCommentsCollectionReplies)

handler.post(commentCollectionReply)

handler.put(updateCollectionCommentReply)

handler.delete(deleteCollectionCommentReply)

export default handler;