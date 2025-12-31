import { useSelector } from 'react-redux';

const TopGameControls = ({ isCreator, onStartNewGame }) => {
  const currentTurn = useSelector((s) => s.game?.currentTurn ?? 'red');
  const isRed = String(currentTurn).toLowerCase() === 'red';

  return (
    <div
      className="
        fixed top-3 sm:top-4 left-1/2 -translate-x-1/2
        z-[60]
        flex flex-col items-center gap-2
        w-full px-4
        pointer-events-none
      "
    >
      {/* Start New Game */}
      {isCreator && (
        <div className="pointer-events-auto">
          <button
            onClick={onStartNewGame}
            className="
              w-full sm:w-auto max-w-xs
              px-4 py-2
              rounded-full
              bg-amber-500 text-white font-semibold
              shadow-md hover:opacity-90
              text-sm sm:text-base
            "
          >
            Start New Game
          </button>
        </div>
      )}

      {/* Turn badge */}
      <div className="pointer-events-none">
        <div
          className={`flex items-center gap-3 px-4 py-2 rounded-full shadow-lg text-white select-none
          ${isRed ? 'bg-red-600' : 'bg-blue-600'}`}
        >
          <div className="w-3 h-3 rounded-full bg-white/80" />
          <div className="font-semibold tracking-wider">
            {isRed ? 'Red Team Turn' : 'Blue Team Turn'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopGameControls;
