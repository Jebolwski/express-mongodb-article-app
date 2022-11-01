const { application } = require("express");
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const joi = require("joi");
const { registerValidation } = require("../validation");
const { loginValidation } = require("../validation");
const dotenv = require("dotenv");
dotenv.config();

router.post("/sign-in", async (req, res, next) => {
  try {
    const { error } = loginValidation(req.body);
    if (error) {
      res.status(400).json({ msg: error.details[0].message });
      next();
    }
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ msg: "Both email and password are required 😢" });
      next();
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ msg: "User not found 😢" });
      next();
    }
    const isMatched = await user.comparePassword(password);
    if (!isMatched) {
      res.status(400).json({ msg: "Invalid credentails 😢" });
      next();
    }
    if (user) {
      const token = jwt.sign(
        {
          username: user.username,
          avatar: user.profilePicture,
          id: user._id,
          email: user.email,
        },
        process.env.JWT_SECRET
      );
      console.log(token);
      res.status(200).json({ msg: "Logged in", token: token });
    }
  } catch (e) {}
});

router.post("/sign-up", async (req, res, next) => {
  const { error } = loginValidation(req.body);

  if (error) {
    res.status(500).json({ msg: error.details[0].message });
  }
  const { username, email, password } = req.body;
  if (email) {
    const userExist = await User.findOne({ email: email });

    if (userExist) {
      res.status(400).json({
        message: "Email already exists 😥",
      });
      next();
    }
  }
  let user = new User(req.body);
  try {
    const saved_user = await user.save();
    res.status(201).json({
      message: "User created successfully",
      user: saved_user,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

module.exports = router;
