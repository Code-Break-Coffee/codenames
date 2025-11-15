const Game = require("../model/Game.js");

function handleSocketEvents(io, socket) {

  socket.on("joinGame", (gameId) => {
    socket.join(gameId);
    console.log(`🔵 User ${socket.id} joined game ${gameId}`);
  });

  socket.on("revealCard", async ({ gameId, cardId }) => {
    console.log(`🟥 Card revealed in game ${gameId}: ${cardId}`);
    let game=await Game.findById(gameId);
    const card = game.board[cardId];
    const color=card.type;
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
