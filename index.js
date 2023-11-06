//Require our packages
require("dotenv").config();
const express = require("express");
const flash = require("express-flash");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const ejs = require("ejs");
const path = require('path');
const methodOverride = require("method-override");

//require routes
const authRoute = require("./routes/auth");
const quoteRoute = require("./routes/quote");

// Set the host based on the HOST environment variable, defaulting to 'localhost'
const host = process.env.HOST || 'localhost';

const port = process.env.PORT || 5500;


//setup application
const app = express();

//setup view engine EJS, body-parser and express-static
app.set("view engine", "ejs");

app.use(bodyparser.urlencoded({ extended: true }));
//app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));


//setup session
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

//initialize passport
app.use(passport.initialize());

//use passport to deal with session
app.use(passport.session());

// Express-flash middleware setup
app.use(flash());

//Connect to database
mongoose.connect(process.env.DB_CONNECT)
.then(() => console.log("Database connected"))
.catch(err => console.log(err))

//use routes
app.use("/", authRoute);
app.use("/", quoteRoute);




//start the server
app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
  });

