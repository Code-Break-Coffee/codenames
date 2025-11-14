import PlayerList from "./PlayerList";

const TeamPanel = ({ team, score, concealers, revealers, joinFunction }) => {
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
        <p className="text-lg font-medium text-[#717182] mb-2">Cards Left</p>
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-4 ${colorClasses.border} ${colorClasses.bg} ${colorClasses.headerText} text-4xl font-extrabold shadow-inner`}>
          {score}
        </div>
      </div>

      {/* Players List Grouped */}
      <div className="space-y-4">
        <PlayerList team={team} title="Revealers" players={revealers} colorClasses={colorClasses}/>
        <PlayerList team={team} title="Concealers" players={concealers} colorClasses={colorClasses}/>
      </div>
    </div>
  );
};

export default TeamPanel;