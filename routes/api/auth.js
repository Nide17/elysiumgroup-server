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
const sendEmail = require("./emails/sendEmail")

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


// @route   POST api/auth/login
// @desc    Auth a user
// @access  GET Public
router.post('/login',
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


// @route   POST api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {

    const { name, email, password } = req.body
    const emailTest = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i

    // Simple validation
    if (!name || !email || !password) {
        return res.status(400).json({ msg: 'Please fill all fields' })
    }

    else if (!emailTest.test(email)) {
        return res.status(400).json({ msg: 'Please provide a valid email!' })
    }

    try {
        const user = await User.findOne({ email })
        if (user) throw Error('User already exists')

        // Create salt and hash
        const salt = await bcrypt.genSalt(10)
        if (!salt) throw Error('Something went wrong with bcrypt')

        const hash = await bcrypt.hash(password, salt)
        if (!hash) throw Error('Something went wrong hashing the password')

        const newUser = new User({
            name,
            email,
            password: hash
        })

        const savedUser = await newUser.save()
        if (!savedUser) throw Error('Something went wrong saving the user')

        sendEmail(
            savedUser.email,
            "Welcome to Elysium Group Ltd, your account is created!",
            {
                name: savedUser.name,
            },
            "./template/welcome.handlebars")

        // Sign and generate token
        const token = jwt.sign(
            {
                _id: savedUser._id,
                role: savedUser.role
            },
            process.env.JWT_SECRET || config.get('jwtSecret'),
            { expiresIn: '2h' }
        )

        res.status(200).json({
            token,
            user: {
                _id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role
            }
        })
    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route  POST api/auth/forgot-password
// @desc    
// @access  
router.post('/forgot-password', async (req, res) => {

    const email = req.body.email

    try {
        const userToReset = await User.findOne({ email })

        if (!userToReset) throw Error('User Does not exist')

        res.json(userToReset)

        // check if there is an existing token for this user & delete it.
        let tokn = await PswdResetToken.findOne({ userId: userToReset._id })
        if (tokn) {
            await tokn.deleteOne()
        }

        // create a new random token 
        let resetToken = crypto.randomBytes(32).toString("hex")

        // Create salt and hash
        const salt = await bcrypt.genSalt(10)
        if (!salt) throw Error('Something went wrong with bcrypt')

        const hash = await bcrypt.hash(resetToken, salt)

        await new PswdResetToken({
            userId: userToReset._id,
            token: hash,
            createdAt: Date.now(),
        }).save()

        const clientURL = process.env.NODE_ENV === 'production' ?
            'https://www.elysiumgroupltd.com/' : 'http://localhost:3000'

        const link = `${clientURL}/reset-password?token=${resetToken}&id=${userToReset._id}`

        sendEmail(
            userToReset.email,
            "Password reset for your Elysium Group account!",
            {
                name: userToReset.name,
                link: link,
            },
            "./template/requestResetPassword.handlebars"
        )

        return link

    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

// @route   POST api/auth/reset-password
// @desc    
// @access  

router.post('/reset-password', async (req, res) => {

    const { userId, token, password } = req.body

    let passwordResetToken = await PswdResetToken.findOne({ userId })

    if (!passwordResetToken) {
        throw new Error("Invalid or expired password reset token")
    }

    const isValid = await bcrypt.compare(token, passwordResetToken.token)

    if (!isValid) {
        throw new Error("Invalid or expired password reset token")
    }

    // Create salt and hash
    const salt = await bcrypt.genSalt(10)
    if (!salt) throw Error('Something went wrong with bcrypt')

    const hash = await bcrypt.hash(password, salt)

    // process sent new data
    await User.updateOne(
        { _id: userId },
        { $set: { password: hash } },
        { new: true }
    )

    const resetUser = await User.findById({ _id: userId })

    sendEmail(
        resetUser.email,
        "Password reset for your Elysium Group account is successful!",
        {
            name: resetUser.name,
        },
        "./template/resetPassword.handlebars")

    await passwordResetToken.deleteOne()

    return true
})


// @route   GET api/auth/user
// @desc    Get user data to keep logged in user token bcz jwt data are stateless
// @access  Private: Accessed by any logged in user
router.get('/user', auth, async (req, res) => {

    try {
        const user = await User.findById(req.user._id)
            .select('-password')
        if (!user) throw Error('User Does not exist')
        res.json(user)
    } catch (err) {
        res.status(400).json({ msg: err.message })
    }
})

module.exports = router