const { application } = require("express");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const authenticationMiddleware = require("../middleware/auth");
const Article = require("../models/article");
const User = require("../models/user");
const mongoose = require("mongoose");
const multer = require("multer");
const { articleValidation } = require("../validation");
const upload = multer({ dest: "uploads/article/" });

router.get("/", async (req, res) => {
  let articles = await Article.find();
  res.status(200).json(articles);
});

router.post(
  "/add",
  authenticationMiddleware,
  upload.single("file"),
  async (req, res, next) => {
    try {
      const { error } = articleValidation(req.body);
      if (error) {
        res.status(400).json({ msg: error.details[0].message });
        next();
      }
      let user = jwt.decode(req.headers.authorization.split(" ")[1]);
      if (user) {
        if (req.body.desc && req.body.name) {
          let article = new Article({
            name: req.body.name,
            desc: req.body.desc,
            user: user,
            file: req.file,
          });
          article = await article.save();
          res.status(200).json({ msg: "Article was created successfully 🌝" });
        }
      } else {
        return res.status(400).json({ msg: "You are not logged in 😢" });
      }
    } catch (error) {
      console.log(error.message);
    }
  }
);

router.patch(
  "/edit/:id",
  authenticationMiddleware,
  upload.single("file"),
  async (req, res, next) => {
    try {
      const { error } = articleValidation(req.body);

      if (error) {
        res.status(400).json({ msg: error.details[0].message });
        next();
      }
      let user = jwt.decode(req.headers.authorization.split(" ")[1]);
      if (user) {
        if (req.body) {
          let article = await Article.findByIdAndUpdate(
            req.params.id,
            req.body
          );
          res.status(200).json({
            msg: "Article was edited successfully 🌝",
            article: await Article.findById(article._id),
          });
        } else {
          res.status(400).json({
            msg: "No data was given to us 🌝",
          });
        }
      } else {
        res.status(400).json({ msg: "You are not logged in 😢" });
      }
    } catch (error) {
      console.log(error.message);
    }
  }
);

router.delete("/delete/:id", authenticationMiddleware, async (req, res) => {
  try {
    let user = jwt.decode(req.headers.authorization.split(" ")[1]);
    if (user) {
      let article = await Article.findById(req.params.id);
      if (!article) {
        res
          .status(400)
          .json({ msg: "Couldnt find the article you were looking for 🥲" });
      }
      await article.remove();
      res.status(200).json({ msg: "Article has been deleted successfully 🌝" });
    } else {
      res.status(400).json({ msg: "You are not logged in 😢" });
    }
  } catch (error) {
    console.log(error.message);
  }
});

module.exports = router;
