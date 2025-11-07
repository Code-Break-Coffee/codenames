const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  word: { type: String, required: true },
  type: { type: String, enum: ["red", "blue", "neutral", "assassin"], required: true },
  revealed: { type: Boolean, default: false }
});

const gameSchema = new mongoose.Schema({
  board: [cardSchema],
  currentTurn: { type: String, default: "red" },
  redScore: { type: Number, default: 9 },
  blueScore: { type: Number, default: 8 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Game", gameSchema);
