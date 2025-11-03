// Deck.jsx
import { DeckCard } from "./DeckCard";
import ThemeToggle from "./ThemeToggle";
import Teams from "./Teams";
import ClueInput from "./ClueInput"; // Import the new component

const Deck = () => {

  const cards = [
    { word: "Phoenix", team: "blue" },
    { word: "Dragon", team: "red" },
    { word: "Ocean", team: "blue" },
    { word: "Flame", team: "red" },
    { word: "Crystal", team: "blue" },
    { word: "Sunset", team: "red" },
    { word: "Arctic", team: "blue" },
    { word: "Mars", team: "red" },
    { word: "Neptune", team: "blue" },
    { word: "Volcano", team: "red" },
    { word: "Glacier", team: "blue" },
    { word: "Torch", team: "red" },
    { word: "Sapphire", team: "blue" },
    { word: "Ruby", team: "red" },
    { word: "River", team: "blue" },
    { word: "Ember", team: "red" },
    { word: "Frost", team: "blue" },
    { word: "Castle", team: "neutral" },
    { word: "Tower", team: "neutral" },
    { word: "Bridge", team: "neutral" },
    { word: "Garden", team: "neutral" },
    { word: "Pyramid", team: "neutral" },
    { word: "Temple", team: "neutral" },
    { word: "Mountain", team: "neutral" },
    { word: "Assassin", team: "assassin" },
  ];

  return (
    <>
      {/* Outer container remains full screen and relative */}
      <div className="relative w-screen h-screen flex items-center justify-center dark:bg-gradient-to-r dark:from-black dark:via-purple-950 dark:to-black bg-gradient-to-r from-indigo-200 via-white to-sky-200">
        
        {/* Teams are absolutely positioned and don't affect main layout */}
        <Teams /> 

        {/* New Inner Flex Container: Column layout to stack deck and clue input */}
        <div className="flex flex-col items-center justify-center">
            
          {/* Deck/Board Container - Height slightly shortened to 600px */}
          <div className="p-6 gap-4 grid grid-rows-5 grid-cols-5 border-[1px] dark:border-white/10 rounded-[30px] w-[1100px] h-[750px] dark:bg-black/40 bg-white/40">
            {cards.length > 0 ? (
              cards.map((card, index) => (
                <DeckCard
                  key={index}
                  word={card.word}
                  team={card.team}
                />
              ))
            ) : (
              <></>
            )}
          </div>
          
          {/* Clue Input Component - Placed right below the deck */}
          <ClueInput />
          
        </div>
        
        <ThemeToggle />
      </div>
    </>
  );
};

export default Deck;