const express = require("express");
//Express Router
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const validatePostInput = require("../../validation/post");


/* @route  GET api/posts
 * @desc   Get posts.
 * @access Public
 */
router.get("/", (req, res) => {
    Post.find()
        .sort({ date: -1 })
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({ nopostfound: "No post found with that id" }));
});

/* @route  GET api/posts/:id
 * @desc   Get posts by id
 * @access Public
 */
router.get("/:id", (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({ nopostfound: "No post found with that id" }));
});


/* @route  POST api/posts
 * @desc   Create Users routes.
 * @access Private
 */
router.post("/", passport.authenticate('jwt', { session: false }), (req, res) => {

    //Validate Post data
    const postBody = req.body;
    console.log(req);
    const { errors, isValid } = validatePostInput(postBody);
    console.log('posts create ');
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: postBody.text,
        name: postBody.name,
        avatar: postBody.name,
        user: req.user.id
    });

    //Save Post
    newPost.save().then(post => res.json(post));
});


/* @route  DELETE api/posts/:id
 * @desc   Delete post
 * @access Private
 */

router.delete("/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    //check for post owner
                    if (post.user.toString() !== req.user.id) {
                        return res.status(401).json({ notauthorized: "User not authorized" });
                    }

                    //Delete
                    post.remove().then(() => res.json({ success: true }));
                }).catch(err => res.status(404).json({ postnotfound: "Post Not Found" }));
        });
});

/* @route  POST api/posts/like/:id
 * @desc   Like post
 * @access Private
 */

router.post("/like/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id.length) > 0) {
                        //Already Liked by this User
                        return res.status(400).json({ alreadyLiked: 'User already liked this Post' });
                    }

                    //Add user id to the Likes array of the Post.
                    post.likes.unshift({ user: req.user.id });
                    post.save().then(post => res.json(post));
                }).catch(err => res.status(404).json({ postnotfound: "Post Not Found" }));
        });
});

/* @route  POST api/posts/unlike/:id
 * @desc   UnLike post
 * @access Private
 */

router.post("/unlike/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id.length) === 0) {
                        //not liked
                        return res.status(400).json({ notliked: 'You have not yet liked this post' });
                    }

                    //Remove the like from index array
                    const removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user.id);

                    post.likes.splice(removeIndex, 1);

                    post.save().then(post => res.json(post));

                }).catch(err => res.status(404).json({ postnotfound: "Post Not Found" }));
        });
});

/* @route  POST api/posts/comment/:id
 * @desc   Add comment to Post
 * @access Private
 */
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validatePostInput(postBody);
    console.log('posts comment ');
    if (!isValid) {
        return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id
            }

            //Push this to Comments array
            post.comments.unshift(newComment);

            //Save
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ nopostfound: 'No Post Found' }));
});

/* @route  DELETE api/posts/comment/:id/:comment_id
 * @desc   Delete comment to Post
 * @access Private
 */
router.delete('/comment/:id/:commend_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Post.findById(req.params.id)
        .then(post => {

            //Check if the comment exists on the post..
            if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
                return res.status(404).json({
                    commentnotexists: 'Comment doesnot exist'
                });
            }

            //Get remove Index
            const removeIndex = post.comments
                .map(item => item._id.toString())
                .indexOf(req.params.comment_id);

            //Slice comment out of the post.. 
            post.comments.splice(removeIndex, 1);

            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ nopostfound: 'No Post Found' }));
});


module.exports = router;

