import dbConnect from "../../../config/dbConnect"
import nc from "next-connect"
import { allCollections, createCollection } from "../../../controllers/collectionController"

dbConnect()

const handler = nc()

handler.get(allCollections)

handler.post(createCollection)

export default handler;