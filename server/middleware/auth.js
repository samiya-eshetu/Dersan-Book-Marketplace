const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const authHeader = req.headers.authorization; // expects: "Bearer <token>"

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // ← change .id to .userId // attach the logged-in user's ID to the request
    next(); // let the request continue to the actual route
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = auth;
