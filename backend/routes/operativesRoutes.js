const express = require('express');
const mongoose = require('mongoose');
const Game = require("../model/Game");
const operative_router = express.Router();

// POST /click
// Safely reveal a card by word for a given game. Validate inputs server-side
// and avoid putting unsanitized user input directly into the query object
// (prevents NoSQL injection flagged by CodeQL).
operative_router.post('/click', async (req, res) => {
  const { gameId, word } = req.body || {};

  // Validate gameId
  if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ error: 'Invalid or missing gameId' });
  }

  // Validate word (simple length/type checks)
  if (typeof word !== 'string' || !word.trim() || word.length > 200) {
    return res.status(400).json({ error: 'Invalid word' });
  }
  const safeWord = word.trim();

  try {
    // Load the game document server-side and find the matching card index.
    // This avoids constructing a query object that includes raw user input.
    const game = await Game.findById(gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const idx = (game.board || []).findIndex((c) => c && c.word === safeWord);
    if (idx === -1) return res.status(404).json({ error: 'Card not found' });

    // Update the card and persist. Only change the field if it's not already revealed.
    if (!game.board[idx].revealed) {
      game.board[idx].revealed = true;
      await game.save();
    }

    return res.json({ board: game.board, redScore: game.redScore, blueScore: game.blueScore });
  } catch (err) {
    console.error('Error in /click:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = operative_router;
