function broadcastMessage(io, message) {
  io.emit('receiveCardClick', message);
}

module.exports = { broadcastMessage };
