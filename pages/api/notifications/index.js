import dbConnect from "../../../config/dbConnect"
import nc from "next-connect"
import { allNotifications, createNotification } from "../../../controllers/notificationController"

dbConnect()

const handler = nc()

handler.get(allNotifications)

handler.post(createNotification)

export default handler;