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

router.patch("/edit/:id", async (req, res) => {
  try {
    let user = jwt.decode(req.headers.authorization.split(" ")[1]);
    if (user) {
      const getNew = await New.findById(req.params.id);
      if (getNew.user.id == user.id) {
        if (req.body.title) {
          getNew.title = req.body.title;
        }
        if (req.body.text) {
          getNew.text = req.body.text;
        }
        if (req.body.images) {
          getNew.images = req.body.images;
        }
        await getNew.save();
        res
          .status(200)
          .json({ msg: "Successfully edited the new 😄", new: getNew });
      } else {
        res.status(400).json({ msg: "You dont own the new 😅" });
      }
    } else {
      res.status(400).json({ msg: "You are not logged in 😅" });
    }
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    let user = jwt.decode(req.headers.authorization.split(" ")[1]);
    if (user) {
      const getNew = await New.findById(req.params.id);
      if (getNew.user.id == user.id) {
        await getNew.delete();
        res.status(200).json({ msg: "Successfully deleted new 😄" });
        return;
      } else {
        res.status(400).json({ msg: "You dont own the new 😅" });
        return;
      }
    } else {
      res.status(400).json({ msg: "You are not logged in 😅" });
    }
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const getNew = await New.findById(req.params.id);
    res.status(200).json({ new: getNew });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

module.exports = router;
