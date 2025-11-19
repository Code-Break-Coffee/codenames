const { handleSocketEvents, clueSubmitted } = require('../controllers/operativesController');
const Game = require("../model/Game"); // ⬅️ ADD THIS

function socketConnection(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    handleSocketEvents(io, socket);
    clueSubmitted(io, socket);

    // ⬇️ ADD DISCONNECT CLEANUP HERE
    socket.on('disconnect', async () => {
      console.log('🔴 User disconnected:', socket.id);

      try {
        const game = await Game.findOne({ "players.socketId": socket.id });

        if (!game) {
          console.log("No game found for disconnected socket");
          return;
        }

        // remove the player
        game.players = game.players.filter(p => p.socketId !== socket.id);

        await game.save();

        console.log("🧹 Cleaned old player from game:", game._id.toString());

        // notify others in the room
        io.to(game._id.toString()).emit("playersUpdated", { players: game.players });

      } catch (err) {
        console.error("Disconnect cleanup error:", err);
      }
    });
  });
}

module.exports = { socketConnection };
