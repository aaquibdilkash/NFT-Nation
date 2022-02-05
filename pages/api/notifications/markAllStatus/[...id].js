import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { markAllNotificationsDeleted, markAllNotificationStatus } from "../../../../controllers/notificationController"

dbConnect()

const handler = nc()

handler.put(markAllNotificationStatus)
handler.delete(markAllNotificationsDeleted)

export default handler;