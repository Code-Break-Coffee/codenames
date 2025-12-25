import React from 'react';
import { useSelector } from 'react-redux';

const TurnBadge = () => {
  const currentTurn = useSelector((s) => s.game?.currentTurn ?? 'red');
  const isRed = String(currentTurn).toLowerCase() === 'red';

  return (
    <div className="turns absolute left-1/2 -translate-x-1/2 top-6 z-40 pointer-events-none">
      <div className={`flex items-center gap-3 px-4 py-2 rounded-full shadow-lg text-white select-none ${isRed ? 'bg-red-600' : 'bg-blue-600'}`}>
        <div className="w-3 h-3 rounded-full bg-white/80" />
        <div className="font-semibold tracking-wider">{isRed ? 'Red Team Turn' : 'Blue Team Turn'}</div>
      </div>
    </div>
  );
};

export default TurnBadge;
