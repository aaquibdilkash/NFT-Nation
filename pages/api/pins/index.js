import dbConnect from "../../../config/dbConnect"
import nc from "next-connect"
import { allPins, createPin } from "../../../controllers/pinsController"

dbConnect()

const handler = nc()

handler.get(allPins)

handler.post(createPin)

export default handler;