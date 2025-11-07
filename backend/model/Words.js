const mongoose = require("mongoose");

const wordSchema = new mongoose.Schema({
  text: { type: String, required: true, unique: true }
});

module.exports=mongoose.model("Words",wordSchema);