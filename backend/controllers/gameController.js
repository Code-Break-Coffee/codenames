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
    const newGame = new Game({
      board,
      redScore: 9,
      blueScore: 8,
      currentTurn: Math.random() > 0.5 ? "red" : "blue"
    });

    await newGame.save();

    return res.status(201).json({ gameId: newGame._id, board: newGame.board });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



module.exports={getCards,genrate_game};