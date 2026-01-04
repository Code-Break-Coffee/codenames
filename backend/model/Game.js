const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  word: { type: String, required: true },
  type: { type: String, enum: ["red", "blue", "neutral", "assassin"], required: true },
  revealed: { type: Boolean, default: false }
  ,
  // track which players clicked this card (store display names)
  clickedBy: { type: [String], default: [] }
});

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  socketId: { type: String, required: true },
  // allow spectators too
  team: { type: String, enum: ["red", "blue", "spectator"], required: true },
  // allow more role values (spectator / concealer / revealer etc.)
  role: { type: String, enum: ["spymaster", "operative", "spectator", "Concealers", "Revealers"], default: "spectator" }
});

const gameSchema = new mongoose.Schema({
  board: [cardSchema],

  // NEW: Store full player list with name, socketId, team, role
  players: [playerSchema],

  currentTurn: { type: String, default: "red" },
    // Number of guesses left in the current turn (set by clue, decremented by card click)
    turnGuessesLeft: { type: Number, default: 0 },

  // Persist the currently active clue so clients can restore UI after reload.
  // Cleared on turn switch / reset.
  activeClue: {
    word: { type: String, default: null },
    number: { type: mongoose.Schema.Types.Mixed, default: null },
    submittedBy: { type: String, default: null },
    submittedAt: { type: Date, default: null },
  },

  redScore: { type: Number, default: 9 },
  blueScore: { type: Number, default: 8 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Game", gameSchema);
