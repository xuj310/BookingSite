const validateId = (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).json({ message: "Missing ID" });
  }
  next();
};

module.exports = validateId;
