const express = require('express')
const app = express()
const router = require('./src/routes/routes')
require('dotenv').config();
const con = require("./src/config/db.config");
con.on("open", () => {
 console.log("db connected....");
});

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var cors = require("cors");
app.use(cors());
app.options("*", cors());
app.use(express.json());
const port = process.env.APP_PORT;
app.use('/app', router)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})