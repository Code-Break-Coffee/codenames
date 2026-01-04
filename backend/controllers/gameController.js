const Game = require("../model/Game.js");
const Words = require("../model/Words.js");

const getCards = async (req, res) => {
  try {
    const gameId = req.params.id;    

    const game = await Game.findById(gameId);  

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    res.json(game);  
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const genrate_game= async (req,res)=>{
    try{
      const nickname=req.body.nickname;
        const words = await Words.aggregate([{ $sample: { size: 25 } }]);
        const assignments = [
            ...Array(9).fill("red"),
            ...Array(8).fill("blue"),
            ...Array(7).fill("neutral"),
            "assassin"
        ];
        assignments.sort(() => Math.random() - 0.5);
        const board = words.map((w, index) => ({
            word: w.text,
            type: assignments[index],
            revealed: false
        }));
    
      const currentTurn= Math.random() > 0.5 ? 'red' : 'blue';
      const newGame = new Game({
        board,
        redScore: currentTurn==='red' ? 9 : 8 ,
        blueScore: currentTurn==='blue' ? 9 : 8,
        currentTurn: currentTurn
      });

    await newGame.save();

    return res.status(201).json({ gameId: newGame._id, board: newGame.board });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const reset_game = async (req, res) => {
  try {
    const gameId = req.params.id;
    const nickname = req.body.nickname; // optional, retained for parity
    const Words = require('../model/Words');

    const words = await Words.aggregate([{ $sample: { size: 25 } }]);
    const assignments = [
      ...Array(9).fill('red'),
      ...Array(8).fill('blue'),
      ...Array(7).fill('neutral'),
      'assassin',
    ];
    assignments.sort(() => Math.random() - 0.5);
    const board = words.map((w, index) => ({
      word: w.text,
      type: assignments[index],
      revealed: false,
      clickedBy: [],
    }));

    const newTurn = Math.random() > 0.5 ? 'red' : 'blue';

    const updated = await Game.findByIdAndUpdate(
      gameId,
      {
        $set: {
          board,
          redScore: newTurn==='red' ? 9 : 8,
          blueScore: newTurn==='blue' ? 9 : 8,
          currentTurn: newTurn,
          turnGuessesLeft: 0,
          activeClue: { word: null, number: null, submittedBy: null, submittedAt: null },
          finished: false,
          winner: null,
          players:[]
        },
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Game not found' });

    // Emit to all sockets in the room so every connected client refreshes
    const io = req.app.get('io');
    if (io) {
      io.to(gameId).emit('gameReset', {
        board: updated.board,
        currentTurn: updated.currentTurn,
        redScore: updated.redScore,
        blueScore: updated.blueScore,
        players: updated.players || [],
      });
    }

    return res.status(200).json({ message: 'ok', board: updated.board, gameId: updated._id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


const getPlayers=async(req,res)=>{
      try{
         const gameId = req.params.id;
         const data=await Game.findById(gameId);
         return res.status(200).json({players:data.players});
      }
      catch(err){
        return res.status(500).json({message: err.message});
      }
}

const getTurnAndScores=async(req,res)=>{
  try{
      const gameId = req.params.id;
      const data=await Game.findById(gameId);
      return res.status(200).json({gameTurn:data.currentTurn,redScore:data.redScore,blueScore:data.blueScore});
  }
  catch(err){
    return res.status(500).json({message:err.message});
  }
}

// Return the currently active clue for a game (if any)
// Useful for clients that reload/rejoin and need to restore clue UI.
const getActiveClue = async (req, res) => {
  try {
    const gameId = req.params.id;
    const game = await Game.findById(gameId);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    return res.status(200).json({
      activeClue: game.activeClue || { word: null, number: null },
      turnGuessesLeft: typeof game.turnGuessesLeft === 'number' ? game.turnGuessesLeft : 0,
      currentTurn: game.currentTurn,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports={getCards,genrate_game,reset_game,getPlayers,getTurnAndScores,getActiveClue};