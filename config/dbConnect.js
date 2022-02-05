import mongoose from "mongoose"

const dbConnect = () => {
    if (mongoose.connection.readyState >= 1) {
        return
    }

    const URI = process.env.DB_URI
    // const URI = process.env.NODE_ENV !== "production" ? process.env.LOCAL_DB_URI : process.env.DB_URI

    mongoose.connect(URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then((con) => {
        console.log("Connected to database.")
    }).catch((e) => {
        console.log("Connection to database failed.")
    })
}

export default dbConnect