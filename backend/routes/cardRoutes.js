const express = require('express');
const router = express.Router();
const { getCards,genrate_game,getPlayers,getTurnAndScores,reset_game } = require('../controllers/gameController');

router.get('/cards/:id', getCards);

router.post("/generate",genrate_game);
router.post('/reset/:id', reset_game);

router.get("/players/:id",getPlayers);

router.get("/score_and_turn/:id",getTurnAndScores);

module.exports = router;