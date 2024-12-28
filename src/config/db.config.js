const mongoose = require("mongoose");
const DB = process.env.MONGOURL
mongoose.connect(DB);
const con = mongoose.connection;
module.exports = con;
