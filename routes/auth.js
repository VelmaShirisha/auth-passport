//Require express router, passport
const router = require("express").Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require('dotenv');

dotenv.config();

//Require User model
const User = require("../models/User");

//create passport local strategy
passport.use(User.createStrategy());


//Serialize and deserialize user
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

//Configure Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5500/auth/google/quote"
},
function(accessToken, refreshToken, profile, cb) {
  // console.log(profile)
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));



//Google auth route
router.get("/auth/google",
  passport.authenticate("google", {scope: ["profile"]})
);
router.get("/auth/google/quote", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect quotes page.
    res.redirect("/quotes");
  });



// Register user in the database
router.post("/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body; // Capture username and password from the request body

    // Register user
    User.register(new User({ username }), password, async (err, newUser) => {
      if (err) {
        console.error(err);
        return res.redirect("/register");
      }

      // Authenticate the user
      passport.authenticate("local")(req, res, function () {
        res.redirect("/quotes");
      });
    });
  } catch (err) {
    console.error(err);
    res.redirect("/register");
  }
});


//login user
router.post("/auth/login", (req, res) => {
  //Create new user object
  const user = new User({
    username: req.body.username,
    password: req.body.passport,
  });

  //Using passport login method we will check if user credentials are correct or not
  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/quotes");
      });
    }
  });
});

//logout user
router.get("/auth/logout", (req, res) => {
  //use passport logout method with a callback function
  req.logout((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
});

//export router
module.exports = router;
