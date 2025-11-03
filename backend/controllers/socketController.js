const { broadcastMessage } = require('../services/socketService');

function handleSocketEvents(io, socket) {

  socket.on('sendMessage', (data) => {
    console.log('Received message:', data);
    broadcastMessage(io, data);
  });
}

module.exports = { handleSocketEvents };
