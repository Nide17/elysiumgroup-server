const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    name: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    phone: {
        type: String,
    },
    bio: {
        type: String,
    },
    social: {
        twitter: {
            type: String,
        },
        linkedin: {
            type: String,
        },
        facebook: {
            type: String,
        }
    },
    date: {
        type: Date,
        default: Date.now
    }
})

// This creates our model from the above schema, using mongoose's model method
let Profile = mongoose.model("profile", ProfileSchema);

// export it
module.exports = Profile;