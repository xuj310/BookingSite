require("dotenv").config();
const mongoose = require("mongoose");

// Connect to database
const connectDB = async () => {
  mongoose
    .connect(process.env.DB_URL, { useNewUrlParser: true })
    .then(() => console.log("MongoDB connected to: " + process.env.DB_URL))
    .catch((err) => console.error("Connection error:", err));
};

module.exports = connectDB;
