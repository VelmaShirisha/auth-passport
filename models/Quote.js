//Require mongoose
const mongoose = require("mongoose");

//Create Quote Schema
const quoteSchema = new mongoose.Schema(
  {
    quote: {
      type: String,
      required: true
    },
    bgColor: {
      type: String,
      default: "46244c"
    },
    likes: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

//export User model
module.exports = mongoose.model("Quote", quoteSchema);
