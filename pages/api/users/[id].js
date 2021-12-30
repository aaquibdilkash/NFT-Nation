import nc from "next-connect"
import dbConnect from "../../../config/dbConnect"

import { deleteUser, getUser, updateUser } from "../../../controllers/userController"


const handler = nc()

dbConnect()

handler.get(getUser)

handler.put(updateUser)

handler.delete(deleteUser)

export default handler;