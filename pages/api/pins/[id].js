import dbConnect from "../../../config/dbConnect"
import nc from "next-connect"
import { deletePin, getPin, updatePin } from "../../../controllers/pinsController"

dbConnect()

const handler = nc()

handler.get(getPin)

handler.put(updatePin)

handler.delete(deletePin)

export default handler;