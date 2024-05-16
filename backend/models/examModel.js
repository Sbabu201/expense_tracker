const mongoose = require("mongoose")
const examSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    catagory: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },


}, { timestamps: true })
const model = mongoose.model("Exam", examSchema)
module.exports = model