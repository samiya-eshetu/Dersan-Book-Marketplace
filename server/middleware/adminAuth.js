const User = require("../models/User");

// use AFTER auth — expects req.userId to already be set
const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = adminAuth;