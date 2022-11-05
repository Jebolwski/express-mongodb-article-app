const { application } = require("express");
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const joi = require("joi");
const { registerValidation } = require("../validation");
const { loginValidation } = require("../validation");
const nodemailer = require("nodemailer");
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
  const { error } = registerValidation(req.body);

  if (error) {
    res.status(500).json({ msg: error.details[0].message });
    return;
  }
  const { username, email, password } = req.body;
  if (email) {
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      res.status(400).json({
        message: "Email already exists 😥",
      });
      return;
    }
  }
  let hashedpsw = await bcrypt.hash(req.body.password, 10);
  let user = new User({ ...req.body, password: hashedpsw });
  try {
    const saved_user = await user.save();
    res.status(201).json({
      message: "User created successfully",
      user: saved_user,
    });
    return;
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  let { email } = req.body;
  try {
    //! Checking if email was sent to the server
    if (email) {
      let user = await User.findOne({ email: email });
      if (!user) {
        res.status(400).json({ msg: "There is no user with this email 😥" });
      }
      //! Creating token for password reset
      const token = jwt.sign(
        { user_id: user._id, username: user.username },
        process.env.JWT_SECRET,
        {
          expiresIn: "8m",
        }
      );
      //TODO Creating three random numbers to add to :id part and make it more secure
      const random_three =
        parseInt(Math.random() * 10).toString() +
        parseInt(Math.random() * 10).toString() +
        parseInt(Math.random() * 10).toString();
      //TODO The link that is going to be sent to users email
      const link =
        process.env.HOST_LINK +
        "reset-password/" +
        user._id +
        random_three +
        "/" +
        token;

      //!Sending email to user
      let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_SENDER_USER, // generated ethereal user
          pass: process.env.EMAIL_SENDER_PASSWORD, // generated ethereal password
        },
      });
      let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: email, // list of receivers
        subject: "Reset password 😄", // Subject line
        text: "We are here to reset your password 😊", // plain text body
        html: `<b>Link : ${link}</b>`, // html body
      });
      res.status(200).json({ msg: "Successfull sent the mail 🌝", link: link });
    } else {
      res.status(400).json({ msg: "We couldnt recieve your email 😥" });
    }
  } catch (e) {
    res
      .status(500)
      .json({ msg: "Something went wrong 😥", errormsg: e.message });
  }
});

router.post("/reset-password/:user_id/:token", async (req, res) => {
  try {
    //TODO Removing last three protection characters
    let user_id = req.params.user_id.slice(0, req.params.user_id.length - 3);
    let user = await User.findById(user_id);
    //TODO Checking if user_id is invalid
    if (!user) {
      res.status(400).json({ msg: "Invalid user id 😘" });
      return;
    }
    let token = req.params.token;
    //TODO Checking if the user_id matches decoded tokens user_id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.user_id != user._id) {
      res.status(400).json({ msg: "Invalid requirements 😘" });
      return;
    }
    let { newPassword1, newPassword2 } = req.body;
    //TODO Checking if both password1 and password2 are filled in
    if (!newPassword1 || !newPassword2) {
      res
        .status(400)
        .json({ msg: "New password inputs arent fully filled in 😢" });
      return;
    }
    //TODO Checking if both password1 and password2 are same
    if (newPassword1 != newPassword2) {
      res.status(400).json({ msg: "Password fields arent are not matched 😢" });
      return;
    }
    user.password = await bcrypt.hash(newPassword1, 10);
    let updatedUser = await user.save();
    res.status(200).json({
      msg: "User password has been succesfully reseted 😄",
      user: updatedUser,
    });
  } catch (e) {
    if (e.message == "jwt expired") {
      res.status(500).json({ msg: "Jwt token expired 😥" });
    } else {
      res
        .status(500)
        .json({ msg: "Something went wrong 😥", errormsg: e.message });
    }
  }
});

module.exports = router;
