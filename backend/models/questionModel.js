const mongoose = require("mongoose")
const questionSchema = mongoose.Schema({
    exam: {
        type: mongoose.Types.ObjectId,
        ref: "Exam",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    options: [{
        value: {
            type: String,
            required: true
        },
        isTrue: {
            type: Boolean,
            default: false
        }
    }]
}, { timestamps: true })
const model = mongoose.model("Question", questionSchema)
module.exports = model