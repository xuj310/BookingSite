const jwt = require("jsonwebtoken");

// Check the JWT token
const checkUserToken = async (req, res, next) => {
  try {
    let token = req.headers["authorization"];

    if (!token) {
      return res.status(403).send({ error: "No token provided" });
    }
    // Grab the actual token from the header
    token = token.split(" ")[1];
    let decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtain the user details from the decoded token
    req.user = decoded;
    next();
  } catch (error) {
    res.json({ error: error });
  }
};

module.exports = checkUserToken;
