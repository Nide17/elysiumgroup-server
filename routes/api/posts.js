// handle reg & log users
// bring express router for implementing routes in separate files
const express = require("express");
const router = express.Router();

// @route   GET api/Posts
// @desc    GET Test route
// @access  GET Public
router.get('/', (req, res) => res.send('Posts route'));

module.exports = router;