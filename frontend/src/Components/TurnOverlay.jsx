import React from 'react';

const TurnOverlay = ({ team = 'red', isWin = false }) => {
  const isRed = String(team).toLowerCase() === 'red';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black/70" />
      <div className={`relative z-10 w-[800px] h-[220px] rounded-2xl flex items-center justify-center ${isRed ? 'bg-red-600' : 'bg-blue-600'} text-white shadow-2xl`}> 
        <div className="text-center uppercase tracking-wider">
          <div className="text-6xl font-extrabold mb-2">{isRed ? 'RED' : 'BLUE'}</div>
          <div className="text-2xl font-semibold">{isWin ? "Team Wins" : "Team's Turn"}</div>
        </div>
      </div>
    </div>
  );
};

export default TurnOverlay;
