const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const newSchema = mongoose.Schema(
  {
    user: {
      type: Object,
      required: [true, "User is required 🥲"],
    },
    title: {
      type: String,
      required: [true, "Title is required 🥲"],
    },
    images: {
      type: Array,
      required: false,
    },
    text: {
      type: String,
      required: [true, "New' text is required 🥲"],
      max: [
        340,
        "Maximum number of characters allowed in the text is 340 characters 😒",
      ],
      min: [80, "Minimum number of characters allowed in the text is 80 😢"],
    },
  },
  { timestamps: true }
);

// encrypting password before saving
newSchema.pre("save", async function (next) {});

// userSchema.methods.comparePassword = async function (yourPassword) {
//   return await bcrypt.compare(yourPassword, this.password);
// };

module.exports = mongoose.model("New", newSchema);
