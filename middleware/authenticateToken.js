const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  if (!decoded || !decoded.userId) {
    return res.sendStatus(403);
  }

  // Make sure to define JWT_SECRET in your .env file
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verification failed:", err.message);
      return res.sendStatus(403);
    }

    req.userId = decoded.userId;

    next();
  });
}

module.exports = authenticateToken;
