import { useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../Components/ThemeToggle';

// Floating words used on the Home page — keep consistent here
import { FLOATING_WORDS } from '../constants/floating_words';
// const FLOATING_WORDS = [
// 	'AGENT', 'CLUE', 'MISSION', 'INTEL', 'SECRET', 'SPY', 'CARD', 'GUESS', 'TEAM', 'CODE',
// 	'RED', 'BLUE', 'HIDDEN', 'KEY', 'WORD'
// ];

const FloatingWord = ({ word, x, y, size, delay, duration }) => (
  <span
    className="absolute font-mono pointer-events-none select-none text-foreground/15 dark:text-foreground/15 whitespace-nowrap"
    style={{
      top: `${y}%`,
      left: `${x}%`,
      fontSize: `${size}rem`,
      animation: `float ${duration}s linear infinite`,
      animationDelay: `-${delay}s`,
      opacity: 0.8,
    }}
  >
    {word}
  </span>
);

export default function Error() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/', { replace: true }), 3000);
    return () => clearTimeout(t);
  }, [navigate]);

  const wordElements = useMemo(() => {
    return FLOATING_WORDS.map((word, i) => (
      <FloatingWord
        key={i}
        word={word}
        x={Math.random() * 100}
        y={Math.random() * 100}
        size={Math.random() * 1.2 + 0.6}
        delay={Math.random() * 60}
        duration={Math.random() * 30 + 30}
      />
    ));
  }, []);

  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden bg-background text-foreground">
      <style>{`\n        @keyframes float {\n          0% { transform: translate(0, 0) rotate(0deg); opacity: 0.8; }\n          25% { transform: translate(30vw, -30vh) rotate(5deg); opacity: 0.9; }\n          50% { transform: translate(0, -30vh) rotate(-5deg); opacity: 0.7; }\n          75% { transform: translate(-30vw, 0) rotate(5deg); opacity: 0.9; }\n          100% { transform: translate(0, 0) rotate(0deg); opacity: 0.8; }\n        }\n      `}</style>

      <div className="absolute inset-0 z-0">{wordElements}</div>

      <div className="relative z-10 p-8 max-w-lg w-full rounded-2xl shadow-2xl bg-card dark:bg-card/90 border border-border backdrop-blur-md text-center">
        <h1 className="text-6xl font-extrabold mb-4">404</h1>
        <p className="mb-4 text-lg">Page not found.</p>
        <p className="mb-4 text-sm text-muted-foreground">Redirecting to home in 3 seconds...</p>

        <div className="flex gap-3 justify-center mt-4">
          <button
            onClick={() => navigate('/', { replace: true })}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:cursor-pointer"
          >
            Go home now
          </button>
          <Link to="/" className="px-4 py-2 border rounded">
            Cancel
          </Link>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>
    </div>
  );
}
