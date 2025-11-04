const { handleSocketEvents,clueSubmitted } = require('../controllers/operativesController');

function socketConnection(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    handleSocketEvents(io, socket);
    clueSubmitted(io,socket);
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}

module.exports = { socketConnection };
