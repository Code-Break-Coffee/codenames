import { useSelector } from 'react-redux';

const TopGameControls = ({ isCreator, onStartNewGame }) => {
  return (
    <div
      className="
        fixed top-3 sm:top-4 left-1/2 -translate-x-1/2
        z-[60]
        flex items-center justify-center gap-4
        px-4
      "
    >
      {/* Start New Game Button */}
      {isCreator && (
        <button
          onClick={onStartNewGame}
          className="
            pointer-events-auto
            w-full sm:w-auto max-w-xs
            px-4 py-2
            rounded-full
            font-semibold
            text-sm sm:text-base
            text-white
            bg-indigo-600 hover:bg-indigo-700
            dark:bg-indigo-500 dark:hover:bg-indigo-600
            shadow-lg
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
            transform transition-all duration-300 ease-in-out
            hover:scale-105
          "
        >
          Start New Game
        </button>
      )}
    </div>
  );
};

export default TopGameControls;
