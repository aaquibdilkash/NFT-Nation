import dbConnect from "../../../config/dbConnect"
import nc from "next-connect"
import { deleteCollection, getCollection, updateCollection } from "../../../controllers/collectionController"

dbConnect()

const handler = nc()

handler.get(getCollection)

handler.put(updateCollection)

handler.delete(deleteCollection)

export default handler;