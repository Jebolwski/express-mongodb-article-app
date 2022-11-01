const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(400).json({ msg: "No token was provided 😥" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, username } = decoded;
    req.user = { id, username };
    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "An error occurred 😥" });
  }
};

module.exports = authenticationMiddleware;
