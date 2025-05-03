const express = require('express')
const cors = require('cors');
const {authRouter} = require("./routes/auth")
const {eventRouter} = require("./routes/event")


const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use("/user", authRouter)
app.use("/event", eventRouter)

app.get('/', function (req, res) {
  res.status(200).send({"Message": "Hello, this is the sports-social-bff-api"});

})

const server = app.listen(5000, () => {
  console.log('Server is up and running on port 5000');
});


module.exports = server
