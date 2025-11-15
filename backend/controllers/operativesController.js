const Game = require("../model/Game.js");

function handleSocketEvents(io, socket) {

  socket.on("joinGame", (gameId) => {
    socket.join(gameId);
    console.log(`🔵 User ${socket.id} joined game ${gameId}`);
    // send an acknowledgement back to the joining socket
    socket.emit("joinedGame", { gameId, socketId: socket.id });
    // notify other players in the room that a player joined
    socket.to(gameId).emit("playerJoined", { socketId: socket.id });
  });

  socket.on("revealCard", async ({ gameId, cardId }) => {
    console.log(`🟥 Card revealed in game ${gameId}: ${cardId}`);
    let game=await Game.findById(gameId);
    // Try to resolve card by index or by subdocument id
    let card;
    let color;
    if (typeof cardId === 'number' || /^[0-9]+$/.test(String(cardId))) {
      card = game.board[cardId];
    } else {
      // subdocument id (ObjectId string)
      card = game.board.id ? game.board.id(cardId) : game.board.find(c => String(c._id) === String(cardId));
    }
    color = card ? card.type : undefined;
    const updated_score={
      redScore:game.redScore,
      blueScore:game.blueScore
    }
    if(color=="blue"){
      updated_score.blueScore=updated_score.blueScore-1;
    }
    if(color=="red"){
      updated_score.redScore=updated_score.redScore-1;
    }
    let result= await Game.findByIdAndUpdate(gameId,{ $set:updated_score});
    io.to(gameId).emit("cardRevealed", { cardId,updated_score });
  });

  socket.on("sendMessage", (data) => {
    io.emit("receiveCardClick", data);
  });
}

function clueSubmitted(io,socket){
  socket.on("clueSubmitted", (clueData) => {
    console.log("💡 Clue submitted:", clueData);

    io.emit("clueReceived", clueData);
  });
}



module.exports = { handleSocketEvents,clueSubmitted };
