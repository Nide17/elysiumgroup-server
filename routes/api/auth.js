// handle getting jwt for auth

// handle reg & log users
// bring express router for implementing routes in separate files
const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');

// auth middleware to protect routes
const { auth, authRole } = require('../../middleware/auth');

const User = require('../../models/User')

const jwt = require('jsonwebtoken');
const config = require("config");

const { check, validationResult } = require("express-validator")

// @route   GET api/auth
// @desc    GET Auth route
// @access  GET Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error(Token)');        
    }
});


// @route   POST api/auth
// @desc    Auth a user
// @access  GET Public
router.post('/',
    [
        check('email', 'Please enter valid email!').isEmail(),
        check('password', 'Password is required!').exists()
    ],

    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body

        try {
            // see if user exist
            let user = await User.findOne({ email });

            if (!user) {
               return res.status(400).json({ errors: [{ msg: 'No such user' }] });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch) { 
                return res.status(400).json({ errors: [{ msg: 'No Match' }] });
            }

            // Return jsonwebtoken
            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(
                payload, 
                config.get('jwtSecret'),
                { expiresIn: 36000},
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
                );

        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server error(Token-post)');
        }

    });

module.exports = router;