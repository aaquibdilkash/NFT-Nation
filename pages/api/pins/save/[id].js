import nc from "next-connect"
import { savePin } from "../../../../controllers/pinsController"
import dbConnect from "../../../../config/dbConnect"

const handler = nc()

dbConnect()

handler.put(savePin)

export default handler;