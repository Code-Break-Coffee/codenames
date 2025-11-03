const { handleSocketEvents } = require('../controllers/socketController');

function socketConnection(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    handleSocketEvents(io, socket);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}

module.exports = { socketConnection };
