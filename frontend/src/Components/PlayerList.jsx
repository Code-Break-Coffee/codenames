import { JoinContext } from "../context/JoinContext";
import { useContext } from "react";

const PlayerList = ({ team, title, players, colorClasses }) => {
  const { teamInfo, titleInfo, handleJoin } = useContext(JoinContext);
  const [joinedTeam] = teamInfo;
  const [joinedTitle] = titleInfo;

  // Whether the user already belongs to this exact team+title
  const isAlreadyJoined = joinedTeam === team && joinedTitle === title;

  // Rule 1: If already joined "Concealers", cannot join any other title/team (except the one already joined).
  const blockedByConcealers = joinedTitle === "Concealers" && !isAlreadyJoined;

  // Rule 2: If already joined "Revealers", cannot join any "Revealers" (same or other team).
  const blockedByRevealers = joinedTitle === "Revealers" && title === "Revealers" && !isAlreadyJoined;

  // Final permission: can join only if not blocked and not already joined.
  const canJoin = !isAlreadyJoined && !blockedByConcealers && !blockedByRevealers;

  // A helpful message when join is disabled
  let disabledMessage = "";
  if (isAlreadyJoined) disabledMessage = "You have joined this role";
  else if (blockedByConcealers) disabledMessage = "Cannot join — you've already joined Concealers";
  else if (blockedByRevealers) disabledMessage = "Cannot join Revealers — you've already joined Revealers elsewhere";

  return (
    <div className="mb-6">
      <h4
        className={`text-md font-semibold mb-2 border-b pb-1 border-sidebar-border/50 ${colorClasses.text}`}
      >
        {title}
      </h4>

      <div className="space-y-2">
        {players.map((player, index) => {
          const localNick = (typeof window !== 'undefined' && localStorage.getItem('nickname')) || '';
          const isLocal = player === localNick;
          const joinedHere = isAlreadyJoined && isLocal;
          return (
            <div
              key={index}
              className={`flex items-center p-2 rounded-lg transition-colors ${joinedHere ? 'bg-green-100 dark:bg-green-900/30 ring-2 ring-green-400' : 'bg-sidebar-accent hover:bg-sidebar-accent-foreground/10'}`}
            >
              <svg className={`w-4 h-4 mr-3 ${colorClasses.text}`} fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              <span className={`font-medium ${joinedHere ? 'text-green-900 dark:text-green-100' : 'text-sidebar-accent-foreground'}`}>{player}</span>
              {isLocal && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/80 dark:bg-white/10 text-gray-700 dark:text-gray-200 font-semibold">You</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3">
        {isAlreadyJoined ? (
          <button
            className="w-full py-2 px-4 rounded-lg bg-gray-400 text-white font-medium shadow-md cursor-default"
            disabled
            aria-disabled="true"
          >
            Joined
          </button>
        ) : canJoin ? (
          <button
            className={`
              w-full py-2 px-4 rounded-lg 
              ${colorClasses.bg} text-sidebar-primary-foreground 
              hover:opacity-70 transition-opacity font-medium 
              shadow-md ${colorClasses.shadow} hover:cursor-pointer
            `}
            onClick={() => handleJoin(team, title)}
          >
            Join {title}
          </button>
        ) : (
          // disabled button with explanation
          <button
            className="w-full py-2 px-4 rounded-lg bg-gray-300 text-gray-600 font-medium shadow-sm cursor-not-allowed"
            disabled
            title={disabledMessage}
            aria-disabled="true"
          >
            {disabledMessage || "Cannot join"}
          </button>
        )}
      </div>
    </div>
  );
};

export default PlayerList;
