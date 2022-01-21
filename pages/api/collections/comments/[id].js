import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { commentCollection, deleteCollectionComment, updateCollectionComment } from "../../../../controllers/collectionController"

dbConnect()

const handler = nc()

handler.post(commentCollection)

handler.put(updateCollectionComment)

handler.delete(deleteCollectionComment)

export default handler;