import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { commentPin } from "../../../../controllers/pinsController"

dbConnect()

const handler = nc()

handler.put(commentPin)

export default handler;