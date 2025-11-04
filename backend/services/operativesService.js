function broadcastMessage(io, message) {
  io.emit('receiveMessage', message);
}

module.exports = { broadcastMessage };
