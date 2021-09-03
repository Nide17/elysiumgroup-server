const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: 'Visitor'
    },
    avatar: {
        type: String
    }
}, {
    // createdAt,updatedAt fields are automatically added into records
    timestamps: true
});

// This creates our model from the above schema, using mongoose's model method
let User = mongoose.model("user", UserSchema);

// Export the User model
module.exports = User;