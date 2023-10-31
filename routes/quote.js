//require express router
const router = require("express").Router();

//require Quote Model
const Quote = require("../models/Quote");


//create routes
//get home
router.get("/", (req, res) => {
    //lets check if user logged in ? then when he access to this route it will be redirect to quotes page automatically
    if(req.isAuthenticated()) {
        res.redirect("/quotes")
    } else {
        res.render("index");
    }
});

//get register page
router.get("/register", (req, res) => {
    //lets check if user logged in ? then when he access to this route it will be redirect to quotes page automatically
    if(req.isAuthenticated()) {
        res.redirect("/quotes")
    } else {
        res.render("register");
    }
});

//login page
router.get("/login", (req, res) => {
    if(req.isAuthenticated()) {
        res.redirect("/quotes")
    } else {
        res.render("login");
    }
});

//get quotes page(fetch data from db and send to quotes page)
router.get("/quotes", async (req, res) => {
    try{
       //fetch all quotes from db
       const allQuotes = await Quote.find();
       res.render("quotes", {allQuotes, isAuth: req.isAuthenticated() });
    } catch(err) {
        res.send(err);
    }
});

//get Submit page
router.get("/submit", (req, res) => {
    if(req.isAuthenticated()) {
        res.render("submit")
    } else {
        res.redirect("/register");
    }
});


//POST
//Submit a quote and add data to database
router.post("/submit", async(req, res) => {
    try{
       
       const quote = new Quote({
        quote: req.body.quote,
        bgColor: req.body.bgColor.substring(1) //[because color will send in hex format (#eeeee) so we need to remove #]
       });
       //save quote in db
       const saveQuote = await quote.save();
       //redirect to quotes if success
       if (saveQuote) {
        // Redirect to /quotes if the quote is successfully saved
        res.redirect("/quotes");
    } else {
        // Handle the case where saving the quote failed
        res.redirect("/submit");
    }
    } catch(err) {
        res.send(err);
    }
});

//like quotes
router.post("/quotes/like", async(req, res) => {
    try{
        //find the post to update likes
        const post = await Quote.findById(req.body.likesBtn);
        // Update the likes count directly in the post object
        post.likes = post.likes + 1;

        // Save the updated post to the database
        await post.save();
        //redirect to quotes page
        res.redirect("/quotes");

    }catch(err){
        res.send(err);
    }
})



//export router
module.exports = router;