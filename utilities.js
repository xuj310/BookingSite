const bcrypt = require("bcrypt");

const saltRounds = 10;

async function hashPassword(password) {
  // Hashing a password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  return hashedPassword;
}

module.exports = { hashPassword };
