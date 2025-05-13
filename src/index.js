const express = require('express')
const cors = require('cors');
const {authRouter} = require("./routes/auth")
const {eventRouter} = require("./routes/event")
const config = require('./config.js')
const logger = require("./logger.js")

const app = express()

app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

app.use("/user", authRouter)
app.use("/event", eventRouter)

const server = app.listen(5000, () => {
  logger.info('Server is up and running on port 5000');
});


module.exports = server
