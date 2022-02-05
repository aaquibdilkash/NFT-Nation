import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { markNotificationDeleted, markNotificationStatus } from "../../../../controllers/notificationController"

dbConnect()

const handler = nc()

handler.put(markNotificationStatus)
handler.delete(markNotificationDeleted)

export default handler;