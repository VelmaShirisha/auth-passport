//require express router
const router = require("express").Router();
const PDFDocument = require("pdfkit");

//require Quote Model
const Quote = require("../models/Quote");

//create routes
//get home
router.get("/", (req, res) => {
  //lets check if user logged in ? then when he access to this route it will be redirect to quotes page automatically
  if (req.isAuthenticated()) {
    res.status(200).render("/quotes");
  } else {
    res.render("index");
  }
});

//get register page
router.get("/register", (req, res) => {
  //lets check if user logged in ? then when he access to this route it will be redirect to quotes page automatically
  if (req.isAuthenticated()) {
    res.redirect("/quotes");
  } else {
    res.render("register");
  }
});

//login page
router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/quotes");
  } else {
    res.render("login");
  }
});

//get quotes page(fetch data from db and send to quotes page)
router.get("/quotes", async (req, res) => {
  try {
    //fetch all quotes from db
    const allQuotes = await Quote.find();
    res.render("quotes", { allQuotes, isAuth: req.isAuthenticated() });
  } catch (err) {
    res.status(500).send(err);
  }
});

//get Submit page
router.get("/submit", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/register");
  }
});

//POST
//Submit a quote and add data to database
router.post("/submit", async (req, res) => {
  try {
    const quote = new Quote({
      quote: req.body.quote,
      bgColor: req.body.bgColor.substring(1), //[because color will send in hex format (#eeeee) so we need to remove #]
    });
    //save quote in db
    const saveQuote = await quote.save();
    //redirect to quotes if success
    if (saveQuote) {
      req.flash("success", "Quote added successfully.");
      // Redirect to /quotes if the quote is successfully saved
      res.redirect("/quotes");
    } else {
      // Handle the case where saving the quote failed
      res.redirect("/submit");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// get quote and bgColor based on their id
router.get("/edit/:id", async (req, res) => {
  const quoteId = req.params.id; // Use req.params to get the value from URL parameters

  if (quoteId) {
    // Editing an existing quote
    try {
      const quote = await Quote.findById(quoteId);

      if (quote) {
        res.render("editQuote", {
          quote: quote,
          bgColor: `#${quote.bgColor}`,
        });
      } else {
        // Handle the case where the quote is not found
        res.redirect("/quotes");
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }
});

//update quote and bgColor
router.put("/update/:id", async (req, res) => {
  const quoteId = req.params.id;
  const { quote, bgColor } = req.body;

  try {
    const updatedQuote = await Quote.findByIdAndUpdate(
      quoteId,
      {
        quote,
        bgColor: bgColor.substring(1),
      },
      { new: true }
    );

    if (updatedQuote) {
      req.flash("success", "Quote updated successfully.");
      res.redirect("/quotes");
    } else {
      res.redirect("/quotes");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

//downloading a quote
router.get("/download/:id", async (req, res) => {
  try {
    const quoteId = req.params.id;

    const quote = await Quote.findById(quoteId);
    if (!quote) {
      req.flash("error", "Quote not found"); 
      return res.status(404).send("Quote not found");
    }

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set the response header to indicate that this is a PDF file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="quote_${quoteId}.pdf"`
    );

    // Pipe the PDF document to the response stream
    doc.pipe(res);

    // Add the background color for the entire page
    doc.rect(0, 0, 612, 792).fill(`#${quote.bgColor}`);

    // Set the text color
    doc.fillColor("#000000"); // Black text color

    // Add the quote content to the PDF document
    doc.fontSize(12).text(quote.quote, 50, 50, { width: 500, align: "left" });

    // End the PDF document
    doc.end();
  } catch (err) {
    req.flash("error", "Error downloading the quote"); 
    res.status(500).send(err);
  }
});


//Deleting a quote
router.post("/delete/:id", async (req, res) => {
  try {
        const quoteId = req.params.id;

    // Use the Quote model to delete the quote
    await Quote.deleteOne({ _id: quoteId });
    req.flash("success", "Quote deleted successfully.");
    res.redirect("/quotes");
  } catch (error) {
    console.log(error);
    // Handle the error as needed
    res.redirect("/quotes"); // Redirect to quotes page in case of an error
  }
});

//like quotes
router.post("/quotes/like", async (req, res) => {
  try {
    //find the post to update likes
    const post = await Quote.findById(req.body.likesBtn);
    // Update the likes count directly in the post object
    post.likes = post.likes + 1;

    // Save the updated post to the database
    await post.save();
    //redirect to quotes page
    res.redirect("/quotes");
  } catch (err) {
    res.status(500).send(err);
  }
});

//export router
module.exports = router;
