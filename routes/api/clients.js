// handle reg & log users
// bring express router for implementing routes in separate files
const express = require("express");
const router = express.Router();

// @route   GET api/Clients
// @desc    GET Test route
// @access  GET Public
router.get('/', (req, res) => res.send('Clients route'));

module.exports = router;