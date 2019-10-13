const mongoose = require("mongoose");

//Mongoose Schema.
const Schema = mongoose.Schema;

//Create Schema for User Model
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
    //required: true
  }
});

//export mode with model schema
module.exports = User = mongoose.model("users", UserSchema);
