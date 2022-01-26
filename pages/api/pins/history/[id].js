import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { getHistoryPin, saveHistoryPin } from "../../../../controllers/pinsController"

dbConnect()

const handler = nc()

handler.post(saveHistoryPin)

handler.get(getHistoryPin)

export default handler;