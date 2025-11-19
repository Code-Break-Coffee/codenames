const express = require('express');
const router = express.Router();
const { getCards,genrate_game,getPlayers } = require('../controllers/gameController');

router.get('/cards/:id', getCards);

router.post("/generate",genrate_game);

router.get("/players/:id",getPlayers);

module.exports = router;