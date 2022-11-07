const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerValidation } = require("../validation");
const { loginValidation } = require("../validation");
const nodemailer = require("nodemailer");
const authenticationMiddleware = require("../middleware/auth");
const dotenv = require("dotenv");
dotenv.config();

router.post("/sign-in", async (req, res, next) => {
  try {
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
        service: "gmail",
        auth: {
          user: process.env.EMAIL_SENDER_USER,
          pass: process.env.EMAIL_SENDER_PASSWORD,
        },
      });
      let info = await transporter.sendMail({
        from: '"Backend Team"', // sender address
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

router.post("/change-password", authenticationMiddleware, async (req, res) => {
  try {
    let user = jwt.decode(req.headers.authorization.split(" ")[1]);
    if (user) {
      let { oldPassword, newPassword1, newPassword2 } = req.body;
      //TODO Checking if both newpassword1 and newpassword2 are filled in
      if (!newPassword1 || !newPassword2) {
        res
          .status(400)
          .json({ msg: "New password inputs arent fully filled in 😢" });
        return;
      }
      //TODO Checking if both newpassword1 and newpassword2 are same
      if (newPassword1 != newPassword2) {
        res
          .status(400)
          .json({ msg: "New password fields arent are not matched 😢" });
        return;
      }
      let equal = await bcrypt.compare(oldPassword, user.password);
      //! Comparing checking if the old password person entered is true
      if (!equal) {
        res.status(400).json({
          msg: "You old password you entered isnt correct 😒",
        });
        return;
      }
      //TODO Hash new password
      let hashedpsw = await bcrypt.hash(newPassword1, 10);
      user.password = hashedpsw;
      //! Save new password
      let newUser = await user.save();
      res
        .status(200)
        .json({ msg: "Sucessfully changed password 🌝", newUser: newUser });
    } else {
      res.status(400).json({ msg: "You are not logged in 😢" });
    }
  } catch (e) {
    res
      .status(500)
      .json({ msg: "Something went wrong 😥", errormsg: e.message });
  }
});

router.post(
  "/send-change-email",
  authenticationMiddleware,
  async (req, res) => {
    try {
      let user = jwt.decode(req.headers.authorization.split(" ")[1]);
      if (user) {
        //TODO Generating random code
        const token = jwt.sign(
          { user_id: user.id, username: user.username },
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
          "change-email-confirm/" +
          random_three +
          token;
        //! Send the link in mail
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_SENDER_USER,
            pass: process.env.EMAIL_SENDER_PASSWORD,
          },
        });
        let info = await transporter.sendMail({
          from: '"Backend Team"', // sender address
          to: user.email, // list of receivers
          subject: "Change email 😄", // Subject line
          text: "We are here to change your email 😊", // plain text body
          html: `<b>Link : ${link}</b>`, // html body
        });
        res
          .status(200)
          .json({ msg: "Successfully sent the mail message 🌝", link: link });
      } else {
        res.status(400).json({ msg: "You are not logged in 😢" });
      }
    } catch (e) {
      res
        .status(500)
        .json({ msg: "Something went wrong 😥", errormsg: e.message });
    }
  }
);

router.post(
  "/change-email-confirm/:token",
  authenticationMiddleware,
  async (req, res) => {
    try {
      let jwt_user = jwt.decode(req.headers.authorization.split(" ")[1]);
      if (jwt_user) {
        //TODO Getting the real token
        let token = req.params.token.slice(3, req.params.token.length);
        let decoded_data = jwt.verify(token, process.env.JWT_SECRET);
        //! Checking if the current user is the same user with the jwt_tokens user
        if (jwt_user.id == decoded_data.user_id) {
          //TODO Email required
          if (!req.body.email) {
            res.status(200).json({ msg: "Email is required 😒" });
            return;
          }
          let user = await User.findById(decoded_data.user_id);
          //TODO Checking if we found the user
          if (!user) {
            res.status(400).json({ msg: "Couldnt find the user 🤔" });
            return;
          }
          user.email = req.body.email;
          let newUser = await user.save();
          res.status(200).json({ msg: "Successfully changed your email 🌝" });
        } else {
          res.status(400).json({ msg: "Something wrong happenned 🤔" });
          return;
        }
      } else {
        res.status(400).json({ msg: "You are not logged in 😢" });
      }
    } catch (e) {
      if (e.message == "jwt expired") {
        res.status(400).json({ msg: "Jwt token expired 😥" });
      } else {
        res
          .status(400)
          .json({ msg: "Something went wrong 😥", errormsg: e.message });
      }
    }
  }
);

module.exports = router;
