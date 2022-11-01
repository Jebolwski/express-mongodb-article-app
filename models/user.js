const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: [true, "Please add a name 😥"],
      maxlength: 32,
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Please add a e-mail 😄"],
      unique: true,
      // match: [
      //   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      //   "Please add a valid e-mail 😄",
      // ],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Please add a password 😢"],
      minlength: [6, "Password must have at least six(6) characters 😊"],
    },
    role: {
      type: Number,
      default: 0,
      enum: [0, 1, 2],
    },
    profilePicture: {
      type: String,
      trim: true,
      required: [true, "Please enter a profile picture 🌝"],
      default:
        "https://collectionimages.npg.org.uk/std/mw65364/Muhammad-Ali.jpg",
    },
  },
  { timestamps: true }
);

// encrypting password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (yourPassword) {
  return await bcrypt.compare(yourPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
