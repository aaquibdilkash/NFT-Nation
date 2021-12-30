import { allPins, createPin } from "../../../controllers/pinsController"
import nc from "next-connect"
import dbConnect from "../../../config/dbConnect"

const handler = nc()

dbConnect()

handler.get(allPins)

handler.post(createPin)

export default handler;