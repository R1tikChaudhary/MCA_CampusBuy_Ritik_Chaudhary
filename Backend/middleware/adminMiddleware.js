const { isAdminUser } = require("../utils/adminUtils");

const adminMiddleware = (req, res, next) => {
  if (!req.user || !isAdminUser(req.user)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = adminMiddleware;

