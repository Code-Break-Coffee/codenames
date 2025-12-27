import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import ThemeToggle from '../Components/ThemeToggle';
import API_URL from '../apiConfig';

// List of words for the animated background (Increased density)
const FLOATING_WORDS = [
  'AGENT', 'CLUE', 'CONTACT', 'DECRYPT', 'ENCODE', 'MISSION',
  'REVEALER', 'CONCEALER', 'INTEL', 'ASSASSIN', 'RED', 'BLUE', 
  'FIELD', 'CODE', 'TARGET', 'WILD', 'DANGER', 'SECRET', 'PUZZLE',
  'SPY', 'CARD', 'GUESS', 'TURN', 'SCORE', 'TEAM', 'COVER', 'TRAITOR', // New words
  'HIDDEN', 'KEY', 'WORD', 'CYPHER', 'LOCATE', 'VECTOR', 'CONFIRM', 'PASS', // More new words
  
  // Doubling the list for higher density
  'CLUE', 'AGENT', 'ENCODE', 'MISSION', 'REVEALER', 'INTEL', 
  'RED', 'BLUE', 'FIELD', 'CODE', 'TARGET', 'DANGER', 'SECRET', 'PUZZLE',
  'SPY', 'CARD', 'GUESS', 'SCORE', 'TEAM', 'HIDDEN', 'KEY', 'WORD' // Doubled new words
];

// Reusable component for a single floating word (for clarity)
const FloatingWord = ({ word, x, y, size, delay, duration }) => (
  <span 
    // Increased light theme opacity to /15 for visibility
    className="absolute font-mono pointer-events-none select-none text-foreground/15 dark:text-foreground/15 whitespace-nowrap"
    style={{
      top: `${y}%`,
      left: `${x}%`,
      fontSize: `${size}rem`,
      animation: `float ${duration}s linear infinite`,
      animationDelay: `-${delay}s`,
      opacity: 0.8
    }}
  >
    {word}
  </span>
);

const Home = () => {
  const [nickname, setNickname] = useState('');
  const [gameId, setGameId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleCreateGame() {
    let temp_color=localStorage.getItem("theme");
    localStorage.clear();
    localStorage.setItem("theme",temp_color);
    if (!nickname.trim()) {
      alert("Please enter a nickname.");
      return;
    }


// ... existing code ...

    localStorage.setItem("nickname",nickname);
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/generate`, { nickname });
      const newGameId = res.data.gameId;   
      navigate(`/game/${newGameId}`);
    } catch (error) {
      console.error("Failed to create game:", error);
      alert("Could not create game. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = () => {
    let temp_color=localStorage.getItem("theme");
    localStorage.clear();
    localStorage.setItem("theme",temp_color);
    if (!nickname.trim()) {
      alert("Please enter a nickname.");
      return;
    }
    if (!gameId.trim()) {
      alert("Please enter a valid Game ID.");
      return;
    }
    localStorage.setItem("nickname",nickname);
    navigate(`/game/${gameId.trim()}`);
  };

  // Generate unique properties for each floating word
  const wordElements = useMemo(() => {
    return FLOATING_WORDS.map((word, index) => (
      <FloatingWord
        key={index}
        word={word}
        x={Math.random() * 100}
        y={Math.random() * 100}
        size={Math.random() * 1.5 + 0.8}
        delay={Math.random() * 60}
        duration={Math.random() * 30 + 30}
      />
    ));
  }, []);

  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden bg-background text-foreground">
      
      {/* Custom Keyframes for floating words - Increased travel distance */}
      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0.8; }
          25% { transform: translate(30vw, -30vh) rotate(5deg); opacity: 0.9; }
          50% { transform: translate(0, -30vh) rotate(-5deg); opacity: 0.7; }
          75% { transform: translate(-30vw, 0) rotate(5deg); opacity: 0.9; }
          100% { transform: translate(0, 0) rotate(0deg); opacity: 0.8; }
        }
      `}</style>
      
      {/* 1. Floating Words Background Layer (Now covers the whole screen) */}
      {/* Opacity is set to 100% here, letting the individual word component handle transparency */}
      <div className="absolute inset-0 z-0"> 
        {wordElements}
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 p-10 max-w-lg w-full rounded-2xl shadow-2xl bg-card dark:bg-card/90 border border-border backdrop-blur-md">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-primary dark:text-foreground tracking-tight">
          Codenames Clone
        </h1>

        <div className="space-y-6">
          {/* Nickname Input */}
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium mb-2 text-muted-foreground">
              Enter Your Nickname
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g., Agent 007"
              className="w-full p-3 border border-border rounded-lg bg-input-background focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 text-black dark:placeholder-gray-400"
              maxLength={20}
            />
          </div>

          {/* Game ID Input */}
          <div>
            <label htmlFor="gameId" className="block text-sm font-medium mb-2 text-muted-foreground">
              Game ID to Join
            </label>
            <input
              type="text"
              id="gameId"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="e.g., F3K8P1X"
              className="w-full p-3 border border-border rounded-lg bg-input-background focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 text-black tracking-widest dark:placeholder-gray-400"
              maxLength={25}
            />
          </div>

          <div className="pt-4 space-y-3">
            {/* Create Game Button */}
            <button
              onClick={handleCreateGame}
              disabled={isLoading || !nickname.trim() || (gameId && nickname)}
              className={`w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-semibold shadow-lg transition-opacity duration-200
                ${(isLoading || !nickname.trim() || (gameId && nickname)) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`
              }
            >
              {isLoading ? 'Creating...' : 'Create New Game'}
            </button>

            {/* Join Game Button */}
            <button
              onClick={handleJoinGame}
              disabled={!gameId.trim() || !nickname.trim()}
              className={`w-full py-3 px-4 rounded-lg font-semibold shadow-md transition-all duration-200 
                ${(!gameId.trim() || !nickname.trim())
                  ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-70'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`
              }
            >
              Join Existing Game
            </button>
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Home;