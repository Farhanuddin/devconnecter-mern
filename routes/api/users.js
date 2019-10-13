const express = require("express");
//Express Router
const router = express.Router();

//Gravater Module
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

//Load User Input Validation..
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

//Load User Model for Route usage..
const User = require("../../models/User");

////////////////////////////////////

// @route GET api/users/
// @desc Tests users route
// @access Public
router.get("/", (req, res) => res.json({ msg: "Users Api Works" }));

////////////////////////////////////

////////////////////////////////////
// @route GET api/users/register
// @desc Register user
// @access Public

router.post("/register", (req, res) => {
  /** Register User */

  //Validate User Input
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    //Validation didn't Passed..
    return res.status(400).json(errors);
  }

  //User Email Already exists..
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      //Create New User, as don't exist already..
      const avatar = gravatar.url(req.body.email, { s: 200, r: "pg", d: "mm" });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar: avatar,
        password: req.body.password
      });

      //Bcrypt password..
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

////////////////////////////////////

////////////////////////////////////
// @route GET api/users/login
// @desc Login user /Returning JWT Token
// @access Public
router.post("/login", (req, res) => {
  //Validate User Input
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    //Validation didn't Passed..
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  //Does User exists.
  User.findOne({ email }).then(user => {
    //Check for User
    if (!user) {
      errors.email = "User not Found.";
      return res.status(404).json(errors);
    }

    //Check Password with bcrypt, as Email exists in DB..
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        //User exists so we can proceed to send him token

        //Create paylod for JWT
        const payload = { id: user.id, name: user.name, avatar: user.avatar };

        //Sign Token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        errors.password = "Password incorrect.";
        return res.status(400).json(errors);
      }
    });
  });
});
////////////////////////////////////

////////////////////////////////////
// @route GET api/users/current
// @desc  Return current User
// @access Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

////////////////////////////////////

module.exports = router;
