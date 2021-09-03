// handle reg & log users
// bri ng express router for implementing routes in separate files
const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// auth middleware to protect routes
const { auth, authRole } = require('../../middleware/auth');

// @route   GET api/profile/me
// @desc    Current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {

    try {
        // populate to look for name and avatar in user  user:  frim model/ req.user.id  tokden
        const profile = await Profile.findOne({ user: req.user.id }).populate(
            'user',
            ['name', 'avatar']
        );

        if (!profile) {
            return res.status(400).json({ msg: 'There is no such profile' });
        }

        res.json(profile)

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error!')
    }
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/', [auth, [
    check('designation', 'Designation is required!').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { designation, name, image, phone, bio, twitter, linkedin, facebook } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (designation) profileFields.designation = designation;
    if (name) profileFields.name = name;
    if (image) profileFields.image = image;
    if (phone) profileFields.phone = phone;
    if (bio) profileFields.bio = bio;

    // Build social object
    profileFields.social = {}
    if (twitter) profileFields.social.twitter = twitter;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (facebook) profileFields.social.facebook = facebook;

    // update & insert data
    try {

        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            // Update
            console.log("profile exist, let's update!");
            profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
            return res.json(profile);
        }

        // Create
        profile = new Profile(profileFields);

        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error!');
    }
})

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {

    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error!');
    }

});

// @route   GET api/profile/user/user_id
// @desc    Get profile by ID
// @access  Public
router.get('/user/:user_id', async (req, res) => {

    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);

        if (!profile) {
            res.status(400).json({ msg: 'There is no profile for this user!' });
        }
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            res.status(400).json({ msg: 'Profile not found!!' });
        }

        res.status(500).send('Server error!');
    }

});


module.exports = router;