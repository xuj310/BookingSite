const jwt = require("jsonwebtoken");

// This functions checks whether the current user has a valid login
function validateLogin(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ errors: "Not Logged In" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(400).json({ errors: "Invalid Login" });
  }
}

module.exports = validateLogin;