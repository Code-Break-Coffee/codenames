const Game = require("../model/Game.js");

// Track players who have clicked during the current turn for each game
// so each Revealer may only click once per turn. Stored at module scope
// so it's shared across all socket handlers for a given server process.
let clickedPlayersThisTurn = {};

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

  // No longer need in-memory turnCardCounts; use DB field turnGuessesLeft
  // Track cards revealed this turn for each game (reset on turn switch)
  let turnCardCounts = {};

  socket.on("revealCard", async ({ gameId, cardId }) => {
    const effectiveSocketId = socket.id;
    console.log(`🟥 Card revealed in game ${gameId}: ${cardId} by socketID : ${effectiveSocketId}`);
    let game = await Game.findById(gameId);
    if (!game) return;

    // If the game is already finished, ignore further reveal attempts
    if (game.finished) {
      console.log(`⚠️ revealCard ignored: game ${gameId} already finished`);
      return;
    }

    // Try to resolve card by index or by subdocument id
    let card;
    let color;
    if (typeof cardId === 'number' || /^[0-9]+$/.test(String(cardId))) {
      card = game.board[cardId];
    } else {
      card = game.board.id ? game.board.id(cardId) : game.board.find(c => String(c._id) === String(cardId));
    }
    color = card ? card.type : undefined;

    // Record who clicked this card (store player's display name)
    try {
      const clickingPlayer = game.players.find(p => String(p.socketId) === String(effectiveSocketId));
      const clickingName = (clickingPlayer && clickingPlayer.name) ? clickingPlayer.name : 'Anonymous';
      if (card) {
        card.clickedBy = card.clickedBy || [];
        if (!card.clickedBy.includes(clickingName)) {
          card.clickedBy.push(clickingName);
          // persist the clickedBy change before further processing
          await game.save();
        }
      }
    } catch (err) {
      console.warn('Could not record clicking player for card:', err);
    }

    // Update score
    const updated_score = {
      redScore: game.redScore,
      blueScore: game.blueScore
    };
    // Immediate end if an assassin/black card was revealed by the current team
    if (color === 'assassin' || color === 'black') {
      const currentTurnLower = String(game.currentTurn || '').toLowerCase();
      const opponent = currentTurnLower === 'red' ? 'blue' : 'red';

      // Set the OPPOSITE team's score to zero as requested
      if (opponent === 'red') {
        updated_score.redScore = 0;
      } else {
        updated_score.blueScore = 0;
      }

      // Determine winner (the team that did NOT reveal the assassin)
      const winner = currentTurnLower === 'red' ? 'blue' : 'red';

      // Persist final scores and mark game finished
      await Game.findByIdAndUpdate(gameId, { $set: { ...updated_score, turnGuessesLeft: 0, finished: true, winner } });

  // Broadcast the revealed card and final scores (include clickedBy)
  io.to(gameId).emit("cardRevealed", { cardId, updated_score, guessesLeft: 0, cardsRevealedThisTurn: turnCardCounts[gameId], clickedBy: (card && card.clickedBy) ? card.clickedBy : [] });

      // Notify clients that the game ended and who 'won'
      io.to(gameId).emit('gameEnded', { winner, finalScores: updated_score });

      // Stop further processing for this reveal
      return;
    }
    if (color == "blue") {
      updated_score.blueScore = updated_score.blueScore - 1;
    }
    if (color == "red") {
      updated_score.redScore = updated_score.redScore - 1;
    }

    // Track cards revealed this turn
    if (!turnCardCounts[gameId]) {
      turnCardCounts[gameId] = 0;
    }
    turnCardCounts[gameId]++;

    // Decrement guesses left in DB
    let guessesLeft = typeof game.turnGuessesLeft === 'number' ? game.turnGuessesLeft : 0;
    guessesLeft = Math.max(0, guessesLeft - 1);

    // Save score and guesses left
    await Game.findByIdAndUpdate(gameId, { $set: { ...updated_score, turnGuessesLeft: guessesLeft } });

  // Emit card revealed and guesses left and cardsRevealedThisTurn (include clickedBy)
  io.to(gameId).emit("cardRevealed", { cardId, updated_score, guessesLeft, cardsRevealedThisTurn: turnCardCounts[gameId], clickedBy: (card && card.clickedBy) ? card.clickedBy : [] });

    // If guessesLeft is 0, switch turn immediately
    if (guessesLeft === 0) {
      const newTurn = game.currentTurn === "red" ? "blue" : "red";
      await Game.findByIdAndUpdate(gameId, { $set: { currentTurn: newTurn } });
      // Clear clickedBy arrays on all cards when the turn switches
      try {
        const g = await Game.findById(gameId);
        if (g && g.board) {
          g.board.forEach(c => { c.clickedBy = []; });
          await g.save();
        }
  io.to(gameId).emit("turnSwitched", { currentTurn: newTurn });
  // Notify clients to reset their local clickedBy UI state
  io.to(gameId).emit('clearAllClickedBy');
  // Notify clients to hide any persistent clue displays
   io.to(gameId).emit('clearClueDisplay');
   // Also emit a cleared clueReceived payload so clients that listen
   // only for 'clueReceived' (e.g., ClueInput) can reset their local state.
   io.to(gameId).emit('clueReceived', { cleared: true });
      } catch (err) {
        console.error('Error clearing clickedBy on turn switch:', err);
        io.to(gameId).emit("turnSwitched", { currentTurn: newTurn });
      }

      // Prompt the new team's Concealer to submit a clue
      const updatedGame = await Game.findById(gameId);
      if (updatedGame && updatedGame.players) {
        updatedGame.players.forEach(player => {
          if (
            player.role && player.role.toLowerCase().startsWith('conceal') &&
            player.team && player.team.toLowerCase() === newTurn
          ) {
            io.to(player.socketId).emit("requestClue", { currentTurn: newTurn });
          }
        });
      }
      // Reset cards revealed count for new turn
      turnCardCounts[gameId] = 0;
      // Reset clicked players tracking for this game
      clickedPlayersThisTurn[gameId] = [];
    }

    // If the revealed card belongs to the opposing team (not neutral), switch turn immediately.
    // This allows the other team's Revealers to continue clicking next card.
    // Note: game.currentTurn is the turn before this reveal.
    try {
  const currentTurn = String(game.currentTurn || '').toLowerCase();
  const revealedColor = String(color || '').toLowerCase();
  console.log(revealedColor);
  const isTeamColor = revealedColor === 'red' || revealedColor === 'blue';
  // Treat 'white' (neutral) or 'neutral' as a turn-ending reveal as well
  const isNeutralWhite = revealedColor === 'white' || revealedColor === 'neutral';
  if (isNeutralWhite || (isTeamColor && revealedColor !== currentTurn)) {
        // Opponent card revealed -> switch turn now
        const newTurn = currentTurn === 'red' ? 'blue' : 'red';
        await Game.findByIdAndUpdate(gameId, { $set: { currentTurn: newTurn, turnGuessesLeft: 0 } });
        // Clear clickedBy arrays on all cards when the turn switches (opponent card revealed)
        try {
          const g2 = await Game.findById(gameId);
          if (g2 && g2.board) {
            g2.board.forEach(c => { c.clickedBy = []; });
            await g2.save();
          }
          io.to(gameId).emit('turnSwitched', { currentTurn: newTurn });
          io.to(gameId).emit('clearAllClickedBy');
          io.to(gameId).emit('clearClueDisplay');
          // Also notify Revealers/clients that the clue should be cleared
          io.to(gameId).emit('clueReceived', { cleared: true });
        } catch (err) {
          console.error('Error clearing clickedBy on opponent reveal turn switch:', err);
          io.to(gameId).emit('turnSwitched', { currentTurn: newTurn });
        }

        // Prompt new team's Concealer(s)
        const updatedGame2 = await Game.findById(gameId);
        if (updatedGame2 && updatedGame2.players) {
          updatedGame2.players.forEach(player => {
            if (
              player.role && player.role.toLowerCase().startsWith('conceal') &&
              player.team && player.team.toLowerCase() === newTurn
            ) {
              io.to(player.socketId).emit('requestClue', { currentTurn: newTurn });
            }
          });
        }

        // Reset cards revealed count for new turn
        turnCardCounts[gameId] = 0;
        // Reset clicked players tracking for this game
        clickedPlayersThisTurn[gameId] = [];
      }
    } catch (err) {
      console.error('Error handling opponent card auto-switch:', err);
    }
  });

  // Handle UI-only clicks (selection) so we can show who selected a card before it's revealed
  // UI-only clicks (selection): clients may send their display name (nickname)
  // We no longer look up the player by socket id here — the client sends the
  // nickname from localStorage and we use it directly to toggle presence in
  // the card.clickedBy list.
  socket.on("cardClicked", async ({ gameId, cardId, nickname }) => {
    try {
      const incomingName = (nickname && String(nickname).trim()) ? String(nickname).trim() : 'Anonymous';
      console.log(`➡️ [server] cardClicked event: nickname=${incomingName} cardId=${cardId} in game ${gameId}`);
      const game = await Game.findById(gameId);
      if (!game) return;

      // Validate that the player exists and is on the current team and is a Revealer.
      // Prefer lookup by socketId (authoritative); fall back to name if necessary.
      const currentTurnLower = String(game.currentTurn || '').toLowerCase();
      const playerBySocket = game.players && game.players.find(p => String(p.socketId) === String(socket.id));
      const playerByName = game.players && game.players.find(p => String(p.name) === String(incomingName));
      const player = playerBySocket || playerByName || null;

      // Determine a tracker id (prefer socketId) and a display name to add
      const trackerId = (player && player.socketId) ? player.socketId : incomingName;

      if (!player) {
        // Couldn't find the player record in the game. Log a warning but
        // allow the UI-only selection to proceed so the user's click shows up
        // in the UI. This is safer UX-wise than silently dropping the click.
        console.warn(`⚠️ cardClicked: player record not found for '${incomingName}' in game ${gameId}. Falling back to nickname.`);
      } else {
        // role check (allow roles starting with 'reveal')
        const isRevealer = player.role && String(player.role).toLowerCase().startsWith('reveal');
        const playerTeam = player.team ? String(player.team).toLowerCase() : null;
        if (!isRevealer || playerTeam !== currentTurnLower) {
          console.log(`⚠️ cardClicked rejected: ${incomingName} not a Revealer or not on current team (${player.team} vs ${game.currentTurn})`);
          return;
        }
      }

      // Enforce tracking of clicks per turn (track by trackerId). Previously
      // we rejected further clicks entirely which meant a player's name only
      // appeared on the first card they clicked. Instead, keep a record of
      // who clicked this turn but allow adding the player's name to every
      // card they click (so the UI shows their name on each card).
      clickedPlayersThisTurn[gameId] = clickedPlayersThisTurn[gameId] || [];
      if (clickedPlayersThisTurn[gameId].includes(trackerId)) {
        console.log(`ℹ️ cardClicked: ${incomingName} (tracker=${trackerId}) has already clicked this turn in game ${gameId} — will still add name to this card.`);
        // do not return; allow adding the name to this card as well
      }

      // resolve card by index or subdocument id
      let card;
      if (typeof cardId === 'number' || /^[0-9]+$/.test(String(cardId))) {
        card = game.board[cardId];
      } else {
        card = game.board.id ? game.board.id(cardId) : game.board.find(c => String(c._id) === String(cardId));
      }

      if (card) {
        card.clickedBy = card.clickedBy || [];
        // Only add (do NOT remove) so a player can only click once per turn
        if (!card.clickedBy.includes(incomingName)) {
          card.clickedBy.push(incomingName);
        }

  // mark that this player has clicked this turn (store trackerId)
  clickedPlayersThisTurn[gameId].push(trackerId);

        await game.save();

        // Broadcast updated clickedBy list to everyone in the room
        io.to(gameId).emit('cardClicked', { cardId, clickedBy: card.clickedBy });
      }
    } catch (err) {
      console.error('cardClicked error', err);
    }
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
  socket.on("clueSubmitted", async(clueData) => {
    console.log("💡 Clue submitted:", clueData);
    // Emit to the specific game room, not globally
      
      let clueCount = clueData.number;
      if (clueCount === 'infinity') clueCount = 99;
      clueCount = Number(clueCount);
      await Game.findByIdAndUpdate(clueData.gameId, { $set: { turnGuessesLeft: clueCount } });
      
      // Emit to the specific game room, not globally
      if (clueData.gameId) {
        io.to(clueData.gameId).emit("clueReceived", clueData);
      } else {
        io.emit("clueReceived", clueData);
      }
  });
}

  // No longer need manual switchTurn from frontend; handled by card logic




module.exports = { handleSocketEvents,clueSubmitted };
