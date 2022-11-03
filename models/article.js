const mongoose = require("mongoose");
const User = require("../models/user");
const articleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "You have to enter name 😒"],
    max: [60, "Max length is 60 characters long 😥"],
  },
  desc: {
    type: String,
    required: [true, "You have to enter description 😢"],
    max: [180, "Max length is 180 characters long 😥"],
  },
  file: {
    type: Object,
  },
  user: {
    type: Object,
    required: [true, "You are not logged in 😢"],
  },
});

module.exports = mongoose.model("Article", articleSchema);
