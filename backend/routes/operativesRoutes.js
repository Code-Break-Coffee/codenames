const express = require('express');
const operative_router = express.Router();

operative_router.post('/click', (req, res) => {
  const { message } = req.body;
  console.log('🧠 Message received from Axios:', message);
  res.status(200).json({ success: true, message: 'Received successfully' });
});

module.exports = operative_router;
