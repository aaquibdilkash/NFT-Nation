import dbConnect from "../../../../config/dbConnect"
import nc from "next-connect"
import { getOffersPin, makeOffer, withdrawOffer } from "../../../../controllers/pinsController"

dbConnect()

const handler = nc()

handler.get(getOffersPin)

handler.post(makeOffer)

handler.put(withdrawOffer)

export default handler;