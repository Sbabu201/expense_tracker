const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const mongodb = require("./database")
const app = express()
dotenv.config()

app.use(cors());
app.use(express.json());
mongodb()


// rourtes 
const userRoutes = require("./routes/userRoute")
const questionRoutes = require("./routes/questionRoute")


// use routes
app.use("/user", userRoutes)
app.use("/question", questionRoutes)

const PORT = process.env.PORT || 8080

//listen

const server = app.listen(PORT, () => {
    console.log(`backend started at ${PORT}`)
})


