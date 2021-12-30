import nc from "next-connect"
import dbConnect from "../../../config/dbConnect"

import { allUsers, createUser } from "../../../controllers/userController"


const handler = nc()

dbConnect()

handler.get(allUsers)

handler.post(createUser)

export default handler;