import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { savePin } from "../../../../controllers/pinsController"

dbConnect()

const handler = nc()

handler.put(savePin)

export default handler;