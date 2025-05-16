const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    verificationLevel: user.verificationLevel,
  };

  // Sign the token with your secret key and set an expiration time.
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Middleware to verify token on protected routes.
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded payload (user info) to request.
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token", error });
  }
};

module.exports = { generateToken, verifyToken };
