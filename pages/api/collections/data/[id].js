import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { getCollectionData } from "../../../../controllers/collectionController"

dbConnect()

const handler = nc()

handler.get(getCollectionData)

export default handler;