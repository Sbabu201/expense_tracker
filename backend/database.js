const mongoose = require("mongoose")

const MongoDb = async () => {
    try {
        await mongoose.connect(process.env.DB)
        console.log("connected to the database")
    } catch (error) {
        console.log('error', error)
    }
}

module.exports = MongoDb;