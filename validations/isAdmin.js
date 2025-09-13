// Checks whether the user is admin
const isAdmin = async (req, res, next) => {
  if (req.user && req.user.role === process.env.ROLE_ADMIN) {
    next();
  } else {
    res.status(403).json({ error: "Unauthorized, requires Admin access" });
  }
};

module.exports = isAdmin;
