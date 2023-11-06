//Require express router, passport
const router = require("express").Router();
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
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

//login using google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5500/auth/google/quote'
}, async (accessToken, refreshToken, profile, done) => {
  try {
      const user = await User.findOne({ username: profile._json.email });
      if (user) {
          done(null, user);
      } else {
          const newUser = new User({
              name: profile.displayName,
              username: profile._json.email,
              gid: profile.id,
              imageUrl: profile._json.picture,
          });

          newUser.save().then((savedUser) => {
              done(null, savedUser);
          });
      }
  } catch (error) {
      console.error(error);
      done(error);
  }
}));

//Google auth route
router.get("/auth/google",
  passport.authenticate("google", {scope: ["profile"]})
);
router.get("/auth/google/quote", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect quotes page.
    req.flash('success', 'Login successful');
    res.redirect("/quotes");
  },
  function (err, req, res, next) {
    // Error handling for Google authentication failure
    console.error(err);
    req.flash("error", "Google authentication failed. Please try again.");
    res.status(500).redirect("/login");
  }
  );



// Register user in the database
router.post("/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body; // Capture username and password from the request body

    // Register user
    User.register(new User({ username }), password, async (err, newUser) => {
      if (err) {
        console.error(err);
        req.flash("error", "Registration failed. Please try again."); // Set error flash message
        return res.status(500).send('Registration failed. Please try again.');
        //return res.redirect("/register");
      }

      // Authenticate the user
      passport.authenticate("local")(req, res, function () {
        req.flash("success", "Registration successful."); // Set success flash message
        res.status(200).redirect("/quotes");
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
    //res.redirect("/register");
  }
});



// login user
router.post('/auth/login', (req, res, next) => {
  
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Login failed. Please try again.');
    }
    if (!user) {
      return res.status(401).render('login', { error: 'Invalid username or password' });
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return res.status(500).send('Login failed. Please try again.');
      }
      req.flash('success', 'Login successful');
      return res.status(200).redirect('/quotes');
    });
  })(req, res, next);
});


//logout user
router.get("/auth/logout", (req, res) => {
  //use passport logout method with a callback function
  req.logout((err) => {
    if (err) {
      console.log(err);
      res.status(500).send('Logout failed. Please try again.');
    }
    res.redirect("/");
  });
});

//export router
module.exports = router;
