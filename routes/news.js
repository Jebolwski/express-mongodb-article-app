const express = require("express");
const New = require("../models/new");
const authenticationMiddleware = require("../middleware/auth");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/add", authenticationMiddleware, async (req, res) => {
  try {
    if (req.body.title && req.body.text) {
      let user = jwt.decode(req.headers.authorization.split(" ")[1]);
      if (user) {
        const createdNew = new New({
          user: user,
          title: req.body.title,
          text: req.body.text,
          images: req.body.images,
        });
        await createdNew.save();
        res
          .status(200)
          .json({ msg: "Successfully created 😄", new: createdNew });
      } else {
        res.status(400).json({ msg: "You are not logged in 😅" });
      }
    } else {
      res.status(400).json({ msg: "Please fill all input fields 😅" });
    }
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

router.post("/edit/:id", (req, res) => {
  try {
    console.log(req.body);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

router.post("/delete/:id", (req, res) => {
  try {
    console.log(req.body);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

router.post("/:id", (req, res) => {
  try {
    console.log(req.body);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

module.exports = router;
