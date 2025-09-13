const mongoose = require("mongoose");

// Ensures the Id has a valid format
const validateId = (req, res, next) => {
  if (req.query.id && !mongoose.Types.ObjectId.isValid(req.query.id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  next();
};

module.exports = validateId;
