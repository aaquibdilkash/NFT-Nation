import nc from "next-connect"
import { commentPin } from "../../../../controllers/pinsController"
import dbConnect from "../../../../config/dbConnect"

const handler = nc()

dbConnect()

handler.put(commentPin)

export default handler;