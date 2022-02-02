import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { isPinExist } from "../../../../controllers/pinsController"

dbConnect()

const handler = nc()

handler.post(isPinExist)

export default handler;