const jwt = require("jsonwebtoken");

function validateLogin(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ errors: "Not Logged In" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded is:", decoded);
    req.user = decoded; // decoded should contain the user ID
    next();
  } catch (err) {
    res.status(400).json({ errors: "Invalid Login" });
  }
}

module.exports = validateLogin;