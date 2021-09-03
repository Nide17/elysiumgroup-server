// handle reg & log users
// bring express router for implementing routes in separate files
const express = require("express");
const router = express.Router();

// @route   GET api/services
// @desc    GET Test route
// @access  GET Public
router.get('/', (req, res) => res.send('Services route'));

module.exports = router;