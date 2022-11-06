const express = require("express");
const articles = require("./routes/articles");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const users = require("./routes/users");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const dotenv = require("dotenv");
dotenv.config();

mongoose
  .connect(process.env.MONGO_PUBLIC_URL, () => {})
  .then(app.listen(5000, () => {}))
  .catch((err) => {
    console.log(err);
  });

app.use(express.urlencoded({ extended: false }));

app.use("/articles", articles);
app.use("/", users);

app.get("/", (req, res) => {
  res.render("index");
});
