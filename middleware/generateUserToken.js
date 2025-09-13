const jwt = require("jsonwebtoken");

// Generate the token
const generateUserToken = async (req, res, next) => {
  // Generate it based off of name, phone number and role
  const { name, phoneNum, role = "guest" } = req.body;

  try {
    const token = jwt.sign({ name, phoneNum, role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Append the token to the req so we can give it back to the user later
    req.token = token;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Token generation failed" });
  }
};

module.exports = generateUserToken;
