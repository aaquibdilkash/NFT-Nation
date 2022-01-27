import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { commentCollection, deleteCollectionComment, getCommentsCollection, updateCollectionComment } from "../../../../controllers/collectionController"

dbConnect()

const handler = nc()

handler.get(getCommentsCollection)

handler.post(commentCollection)

handler.put(updateCollectionComment)

handler.delete(deleteCollectionComment)

export default handler;