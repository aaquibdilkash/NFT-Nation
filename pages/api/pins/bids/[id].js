import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { getBidsPin, makeAuctionBid, withdrawAuctionBid } from "../../../../controllers/pinsController"

dbConnect()

const handler = nc()

handler.get(getBidsPin)

handler.post(makeAuctionBid)

handler.put(withdrawAuctionBid)

export default handler;