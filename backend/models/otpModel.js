const mongoose = require("mongoose")
const otpSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    expireTime: {
        type: Date,
        default: Date.now,
    }

}, { timestamps: true })
const model = mongoose.model("Otp", otpSchema)
module.exports = model