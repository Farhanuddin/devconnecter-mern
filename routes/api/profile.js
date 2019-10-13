const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load Profile Model
const Profile = require("../../models/Profile");
//Load User Profile
const User = require("../../models/User");

//Load Profile Validation..
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

//router.get("/", (req, res) => res.json({ msg: "Profile Works" }));

//Get Current User Profile Route ::
// @route GET api/profile
// @desc Get current users profile
// @access Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({
      user: req.user.id
    })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile of this users";
          return res.status(404).json(errors);
        }
        return res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route GET api/profile/all
// @desc Get all Profiles
// @access Public
router.get("/all", (req, res) => {

  const errors = {};
  const handle = req.params.handle;

  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
      if (!profiles) {
        //User Profiles not Found.
        errors.noprofiles = "Profiles not Found.";
        res.status(404).json(errors);
      }

      //Return Profile
      res.json(profiles);

    }).catch(err => res.status(404).json(
      { profile: 'There are no profiles' }
    )
    );

});

// @route GET api/profile/handle/:handle
// @desc Get current profile using handle
// @access Public
router.get("/handle/:handle", (req, res) => {

  const errors = {};
  const handle = req.params.handle;

  Profile.findOne({ handle: handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        //Profile not found for this Handle
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }

      //Return Profile
      res.json(profile);

    }).catch(err => res.status(404).json(errors));
});

// @route GET api/profile/user/:userId
// @desc Get current profile using user id
// @access Private
router.get("/user/:userId", (req, res) => {

  const errors = {};
  const userId = req.params.userId;

  Profile.findOne({ user: userId })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        //Profile not found for this Handle
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }

      //Return Profile
      res.json(profile);

    }).catch(err => res.status(404).json(errors));
});


//Create/edit Current User Profile Route ::
// @route POST api/profile/
// @desc Get current users profile
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    //Check validation resposne
    if (!isValid) {
      return res.status(400).json(errors);
    }

    //Get Fields from Body..
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    //Skilsl = Split into Array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    //Social fields
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    console.log(req.body);
    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //Update
        console.log("in update");
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        )
          .then(profile => res.json(profile))
          .catch(err => {
            console.log(err);
          });
      } else {
        //Create

        //Check if handle exists..
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }

          //Save Profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

// @route POST api/profile/experience
// @desc Get experience to profile
// @access Private

router.post("/experience", passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {

      const { errors, isValid } = validateExperienceInput(req.body);
      console.log('farhan');
      //Validate data 
      if (!isValid) {
        console.log(errors);
        return res.status(400).json(errors);
      }

      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      }

      //Add to exp array
      profile.experience.unshift(newExp);

      //Save Profile in experience.. 

      profile.save().then(profile => res.json(profile))
    })
});

// @route POST api/profile/education
// @desc Get education to profile
// @access Private

router.post("/education", passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {

      const { errors, isValid } = validateEducationInput(req.body);
      console.log('education');
      //Validate data 
      if (!isValid) {
        console.log(errors);
        return res.status(400).json(errors);
      }

      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        description: req.body.description
      }

      //Add to exp array
      profile.education.unshift(newEdu);

      //Save Profile in experience.. 

      profile.save().then(profile => res.json(profile))
    })
});

// @route DELETE api/profile/experience
// @desc delete experience to profile
// @access Private

router.delete("/experience/:exp_id", passport.authenticate('jwt', { session: false }), (req, res) => {

  console.log(req.body.id);

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      console.log('coming here');
      const reqBody = req.body;

      console.log(reqBody);
      //Get Remove index of this experience
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

      //Slice out of array
      if (removeIndex && removeIndex != -1) {
        profile.experience.splice(removeIndex, 1);
      }
      //Save
      profile.save().then(profile => res.json(profile));

    }).catch(err => res.status(404).json().json(profile));
});


// @route DELETE api/profile/education
// @desc delete education to profile
// @access Private

router.delete("/education", passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {

      const reqBody = req.body;
      const eduId = req.body.eduId;
      console.log('eduId' + eduId);
      //Get Remove index of this experience
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(eduId);
      console.log(removeIndex);

      //Slice out of array
      if (removeIndex && removeIndex != -1) {
        profile.education.splice(removeIndex, 1);
      }

      //Save
      profile.save().then(profile => res.json(profile));

    }).catch(err => res.status(404).json().json(profile));
});

// @route DELETE api/profile/
// @desc delete user and profile
// @access Private

router.delete("/", passport.authenticate('jwt', { session: false }), (req, res) => {

  Profile.findOneAndRemove({ user: req.user.id })
    .then(() => {

      User.findOneAndRemove({ _id: req.user.id })
        .then(() => res.json({
          success: true
        }));

    }).catch(err => res.status(404).json().json(profile));
});

module.exports = router;
