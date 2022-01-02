import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { makeAuctionBid, withdrawAuctionBid } from "../../../../controllers/pinsController"

dbConnect()

const handler = nc()

handler.post(makeAuctionBid)

handler.put(withdrawAuctionBid)

export default handler;