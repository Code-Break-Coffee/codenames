const express = require('express');
const router = express.Router();
const { getCards,genrate_game } = require('../controllers/gameController');

router.get('/cards/:id', getCards);

router.post("/generate",genrate_game);

module.exports = router;