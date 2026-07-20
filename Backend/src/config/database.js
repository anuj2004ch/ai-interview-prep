const mongoose = require("mongoose")

async function connectToDB() {
    mongoose.set("sanitizeFilter", true)
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to Database")
}

module.exports = connectToDB
