// User.js (User model)
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    googleId: String
});

// Include passport-local-mongoose to enable local authentication
userSchema.plugin(passportLocalMongoose);

// Define a custom method to find or create a user based on Google ID
userSchema.statics.findOrCreate = function (query) {
    const User = this;

    return User.findOne(query)
        .then((user) => {
            if (user) {
                // User already exists, return the existing user
                return user;
            } else {
                // User does not exist, create a new user
                return User.create(query);
            }
        })
        .catch((err) => {
            throw err;
        });
};

// Create and export the User model
module.exports = mongoose.model("User", userSchema);





