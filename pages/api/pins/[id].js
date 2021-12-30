import nc from "next-connect"
import dbConnect from "../../../config/dbConnect"

import { deletePin, getPin, updatePin } from "../../../controllers/pinsController"


const handler = nc()

dbConnect()

handler.get(getPin)

handler.put(updatePin)

handler.delete(deletePin)

export default handler;