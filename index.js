require("dotenv").config();
const express = require("express");
const mongoose = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const helmet = require("helmet");
const cors = require("cors");

mongoose();

const app = express();
// Enable CORS
app.use(cors());
// Use Helmet Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", userRoutes);
app.use("/api", eventRoutes);

// Global error handler. Such as if invalid json is passed in
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
