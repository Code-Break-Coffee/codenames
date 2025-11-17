const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  word: { type: String, required: true },
  type: { type: String, enum: ["red", "blue", "neutral", "assassin"], required: true },
  revealed: { type: Boolean, default: false }
});

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  socketId: { type: String, required: true },
  team: { type: String, enum: ["red", "blue"], required: true },
  role: { type: String, enum: ["spymaster", "operative"], default: "spectator" }
});

const gameSchema = new mongoose.Schema({
  board: [cardSchema],

  // NEW: Store full player list with name, socketId, team, role
  players: [playerSchema],

  currentTurn: { type: String, default: "red" },

  redScore: { type: Number, default: 9 },
  blueScore: { type: Number, default: 8 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Game", gameSchema);
