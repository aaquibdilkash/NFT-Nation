import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { getPropertyPin } from "../../../../controllers/pinsController"

dbConnect()

const handler = nc()

handler.get(getPropertyPin)

export default handler;