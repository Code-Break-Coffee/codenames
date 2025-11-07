const express = require('express');
const Game = require("../model/Game");
const operative_router = express.Router();

operative_router.post('/click', async (req, res) => {
  const { gameId, word } = req.body;
  try {
    const game = await Game.findOneAndUpdate(
      { _id: gameId, "board.word": word },
      { $set: { "board.$.revealed": true } },
      { new: true }
    );
    if (!game) return res.status(404).json({ error: "Game or card not found" });
    res.json({ board: game.board, redScore: game.redScore, blueScore: game.blueScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = operative_router;
