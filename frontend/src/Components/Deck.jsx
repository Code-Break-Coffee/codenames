import { useEffect } from "react";
import axios from "axios";
import socket from "../socket";
import { DeckCard } from "./DeckCard";
import ThemeToggle from "./ThemeToggle";
import Teams from "./Teams";
import ClueInput from "./ClueInput";

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

  // Socket event listener
  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      console.log("🎯 Received live message:", data);
    });

    return () => socket.off("receiveMessage");
  }, []);

  // When card is clicked
  const cardClick = async (card) => {
    try {
      console.log("Card Clcikd");
      await axios.post("http://localhost:3000/api/click", { message: `${card.word} clicked` });

      // Real-time event
      socket.emit("sendMessage", { message: `${card.word} clicked`, team: card.team });
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center dark:bg-gradient-to-r dark:from-black dark:via-purple-950 dark:to-black bg-gradient-to-r from-indigo-200 via-white to-sky-200">
      <Teams />

      <div className="flex flex-col items-center justify-center">
        <div className="p-6 gap-4 grid grid-rows-5 grid-cols-5 border-[1px] dark:border-white/10 rounded-[30px] w-[1100px] h-[750px] dark:bg-black/40 bg-white/40">
          {cards.map((card, index) => (
            <DeckCard
              key={index}
              word={card.word}
              team={card.team}
              click={() => cardClick(card)}
            />
          ))}
        </div>
        <ClueInput />
      </div>

      <ThemeToggle />
    </div>
  );
};

export default Deck;
