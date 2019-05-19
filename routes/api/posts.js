const express = require("express");
//Express Router
const router = express.Router();

/* @route  GET api/posts
 * @desc   Return Users routes.
 * @access Public Route
 */
router.get("/", (req, res) => res.json({ msg: "Posts Works" }));

module.exports = router;
