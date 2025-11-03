// Teams.jsx
import React from 'react';

const PlayerList = ({ team, title, players, colorClasses }) => (
  <div className="mb-6">
    <h4 className={`text-md font-semibold mb-2 border-b pb-1 border-sidebar-border/50 ${colorClasses.text}`}>
      {title}
    </h4>
    <div className="space-y-2">
      {players.map((player, index) => (
        <div 
          key={index} 
          className="flex items-center p-2 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent-foreground/10 transition-colors"
        >
          {/* Using a simple icon for visual distinction */}
          <svg className={`w-4 h-4 mr-3 ${colorClasses.text}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          <span className="font-medium text-sidebar-accent-foreground">{player}</span>
        </div>
      ))}
    </div>
    
    {/* New "Join Team" button */}
    <button 
      className={`
        mt-3 w-full py-2 px-4 rounded-lg 
        ${colorClasses.bg} text-sidebar-primary-foreground 
        hover:opacity-90 transition-opacity font-medium 
        shadow-md ${colorClasses.shadow}
      `}
      // A simple placeholder click handler
      onClick={() => console.log(`Joining ${title} for ${team} team`)} 
    >
      Join {title}
    </button>
  </div>
);


const TeamPanel = ({ team, score, concealers, revealers }) => {
  const colorClasses = team === 'red' 
    ? {
        bg: 'bg-red-500 dark:bg-red-700',
        border: 'border-red-600 dark:border-red-400',
        text: 'text-red-500 dark:text-red-400',
        headerText: 'text-white',
        ring: 'ring-red-500 dark:ring-red-400',
        shadow: 'shadow-red-500/50 dark:shadow-red-700/50'
      }
    : {
        bg: 'bg-blue-500 dark:bg-blue-700',
        border: 'border-blue-600 dark:border-blue-400',
        text: 'text-blue-500 dark:text-blue-400',
        headerText: 'text-white',
        ring: 'ring-blue-500 dark:ring-blue-400',
        shadow: 'shadow-blue-500/50 dark:shadow-blue-700/50'
      };

  return (
    <div
      className={`
        w-64 h-[750px] p-6 rounded-[30px] shadow-2xl transition-colors duration-500
        dark:bg-black/40 bg-white/40 text-sidebar-foreground border border-sidebar-border
        ${colorClasses.shadow}
      `}
    >
      {/* Team Header */}
      <div className={`text-center mb-6 p-3 rounded-xl ${colorClasses.bg} ${colorClasses.headerText} shadow-lg ${colorClasses.shadow}`}>
        <h2 className="text-2xl font-bold uppercase tracking-wider">
          {team} Team
        </h2>
      </div>

      {/* Score Section */}
      <div className="text-center mb-8">
        <p className="text-lg font-medium text-muted-foreground mb-2">Current Score</p>
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-4 ${colorClasses.border} ${colorClasses.bg} ${colorClasses.headerText} text-4xl font-extrabold shadow-inner`}>
          {score}
        </div>
      </div>

      {/* Players List Grouped */}
      <div className="space-y-4">
        <PlayerList team={team} title="Concealers" players={concealers} colorClasses={colorClasses} />
        <PlayerList team={team} title="Revealers" players={revealers} colorClasses={colorClasses} />
      </div>
    </div>
  );
};

const Teams = () => {
  const redTeam = {
    score: 8,
    concealers: ['Viper', 'Blaze'],
    revealers: ['Shadow', 'Scorch']
  };

  const blueTeam = {
    score: 7,
    concealers: ['Tide', 'Aqua'],
    revealers: ['Frost', 'Mist']
  };

  return (
    <>
      <div className="absolute top-[50%] left-8 translate-y-[-50%]">
        <TeamPanel team="red" score={redTeam.score} concealers={redTeam.concealers} revealers={redTeam.revealers} />
      </div>
      <div className="absolute top-[50%] right-8 translate-y-[-50%]">
        <TeamPanel team="blue" score={blueTeam.score} concealers={blueTeam.concealers} revealers={blueTeam.revealers} />
      </div>
    </>
  );
};

export default Teams;