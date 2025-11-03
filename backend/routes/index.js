const express = require('express');
const socket_router = express.Router();

socket_router.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = socket_router;
