function handleSocketEvents(io, socket) {
  socket.on('sendMessage', (data) => {
    console.log('📩 Received message:', data);

    // Broadcast to all clients
    io.emit('receiveMessage', data);
  });
}

module.exports = { handleSocketEvents };
