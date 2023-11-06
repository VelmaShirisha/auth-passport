// User.js (User model)
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");


const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    // Add fields needed for Google OAuth
    gid: String,
    name: String,
    imageUrl: String
});

// Include passport-local-mongoose to enable local authentication
userSchema.plugin(passportLocalMongoose);

// Create and export the User model
module.exports = mongoose.model("User", userSchema);





