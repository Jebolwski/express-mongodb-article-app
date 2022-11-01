const mongoose = require("mongoose");
const User = require("../models/user");
const articleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "You have to enter name 😒"],
  },
  desc: {
    type: String,
    required: [true, "You have to enter description 😢"],
  },
  user: {
    type: Object,
    required: [true, "You are not logged in 😢"],
  },
});

module.exports = mongoose.model("Article", articleSchema);
