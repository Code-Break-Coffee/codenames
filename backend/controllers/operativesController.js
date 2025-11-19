const Game = require("../model/Game.js");

function handleSocketEvents(io, socket) {

  socket.on("joinGame", async ({gameId,nickname}) => {
    socket.join(gameId);
    try {
      const game = await Game.findById(gameId);
      if (!game) {
        console.warn('joinGame: game not found', gameId);
        return socket.emit('joinGameError', { message: 'Game not found' });
      }

      // Check if player already exists by socketId (same connection)
      let playerExists = game.players.find(p => String(p.socketId) === String(socket.id));

      if (!playerExists) {
        // Only add if this is a new connection
        const newPlayer = {
          socketId: socket.id, 
          name: nickname,
          team: "spectator",
          role: "spectator"
        };
        game.players.push(newPlayer);
        await game.save();
        console.log(`🔵 User ${socket.id} joined game ${gameId} as spectator`);
      } else {
        // Player already exists, just update nickname if provided
        if (nickname) {
          playerExists.name = nickname;
          await game.save();
        }
        console.log(`🔵 User ${socket.id} rejoined game ${gameId} (already in players list)`);
      }

      // send an acknowledgement back to the joining socket
      socket.emit("joinedGame", { gameId, socketId: socket.id });
      // notify other players in the room that a player joined
      socket.to(gameId).emit("playerJoined", { socketId: socket.id });
    } catch (err) {
      console.error('joinGame error', err);
      socket.emit('joinGameError', { message: err.message });
    }
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
    io.to(gameId).emit("cardRevealed", { cardId, updated_score });
  });

  // Handle joining a specific team/role
  socket.on("joinTeam", async ({ gameId, nickname, team, role }) => {
    try {
      const game = await Game.findById(gameId);
      if (!game) {
        return socket.emit('joinTeamError', { message: 'Game not found' });
      }

      // Find the existing player by socketId
      let player = game.players.find(p => String(p.socketId) === String(socket.id));

      if (!player) {
        // ❌ Do NOT create a new one
        // They MUST already exist from joinGame
        return socket.emit("joinTeamError", {
          message: "Player not found — did not join the game properly"
        });
      }

      // Update the existing player
      player.team = team;
      player.role = role;
      player.name = nickname || player.name;

      await game.save();

      socket.emit('joinedTeamAck', { players: game.players });
      io.to(gameId).emit('playersUpdated', { players: game.players });

    } catch (err) {
      console.error('joinTeam error', err);
      socket.emit('joinTeamError', { message: err.message });
    }
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
