const express = require("express");
//Express Router
const router = express.Router();

router.get("/", (req, res) => res.json({ msg: "Profile Works" }));

module.exports = router;
