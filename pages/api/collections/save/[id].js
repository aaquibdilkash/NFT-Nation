import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { saveCollection } from "../../../../controllers/collectionController"

dbConnect()

const handler = nc()

handler.put(saveCollection)

export default handler;