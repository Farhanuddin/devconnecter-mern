const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

const app = express();

//Form Body Parser module middlewares..
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//DB Config
const db = require("./config/keys").mongoURI;

//Connect to MongoDB through Mongoose.

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected.."))
  .catch(err => console.log(err));

//Implementing Passport
//Passport Middleware / Initialize
app.use(passport.initialize());

//Set Passport Configurations for our usage..
require("./config/passport")(passport); //Passing in passport of above to this file..

//Using Routes, telling for which routes files to user for which api requests/
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/post", posts);

/**Port Setting and Listening */

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Node Server running on Port. ${port}`));
