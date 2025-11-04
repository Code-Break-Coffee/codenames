function handleSocketEvents(io, socket) {
  socket.on('sendMessage', (data) => {
    console.log('📩 Received message:', data);

    io.emit('receiveCardClick', data);
  });
}

function clueSubmitted(io,socket){
  socket.on("clueSubmitted", (clueData) => {
    console.log("💡 Clue submitted:", clueData);

    io.emit("clueReceived", clueData);
  });
}



module.exports = { handleSocketEvents,clueSubmitted };
