import dbConnect from "../../../config/dbConnect"
import nc from "next-connect"
import { deleteNotification, getNotification, updateNotification } from "../../../controllers/notificationController"

dbConnect()

const handler = nc()

handler.get(getNotification)

handler.put(updateNotification)

handler.delete(deleteNotification)

export default handler;