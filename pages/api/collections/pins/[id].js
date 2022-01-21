import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { addPinToCollection } from "../../../../controllers/collectionController"

dbConnect()

const handler = nc()

handler.put(addPinToCollection)

export default handler;