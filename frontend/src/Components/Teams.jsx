import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import TeamPanel from './TeamPanel';
import axios from 'axios';

import API_URL from '../apiConfig';

import { JoinContext } from '../context/JoinContext';

const Teams = ({ onDataReceived }) => {
  const { gameId } = useParams(); // <-- GET GAME ID FROM URL

  const [joinedTeam, setJoinedTeam] = useState('');
  const [joinedTitle, setJoinedTitle] = useState('');

  const [allPlayers, setAllPlayers] = useState([]); // From API
  const currentTurn = useSelector((state) => state.game.currentTurn);

  const handleJoin = (teamJoin, titleJoin) => {
    setJoinedTeam(teamJoin);
    setJoinedTitle(titleJoin);
    onDataReceived(teamJoin, titleJoin);
  };

  // Fetch players automatically
  useEffect(() => {
    if (!gameId) return;

    // ... existing code ...

    const fetchPlayers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/players/${gameId}`);
        setAllPlayers(res.data.players || []);
      } catch (err) {
        console.error('Failed to load players', err);
      }
    };

    fetchPlayers();

    // Auto refresh players every 1.5 sec
    const interval = setInterval(fetchPlayers, 5500);
    return () => clearInterval(interval);
  }, [gameId]);

  // Filter players
  const redConcealers = allPlayers.filter((p) => p.team === 'red' && p.role === 'Concealers').map((p) => p.name);
  const redRevealers = allPlayers.filter((p) => p.team === 'red' && p.role === 'Revealers').map((p) => p.name);

  const blueConcealers = allPlayers.filter((p) => p.team === 'blue' && p.role === 'Concealers').map((p) => p.name);
  const blueRevealers = allPlayers.filter((p) => p.team === 'blue' && p.role === 'Revealers').map((p) => p.name);

  // Read persisted/Redux scores and fall back to 0 if shape varies
  const scoresState = useSelector((state) => state.scores || {});
  const redScore = scoresState?.red ?? scoresState?.redScore ?? scoresState?.red_team ?? scoresState?.redTeam ?? 0;
  const blueScore = scoresState?.blue ?? scoresState?.blueScore ?? scoresState?.blue_team ?? scoresState?.blueTeam ?? 0;

  const TurnIndicator = ({ team }) => {
    if (currentTurn !== team) return null;
    const textColor = team === 'red' ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400';
    return (
      <h3 className={`text-center text-xl font-bold mb-2 uppercase tracking-wider ${textColor}`}>
        Current Turn
      </h3>
    );
  };

  return (
    <JoinContext.Provider
      value={{
        teamInfo: [joinedTeam, setJoinedTeam],
        titleInfo: [joinedTitle, setJoinedTitle],
        handleJoin,
      }}
    >
      {/* Desktop: side panels positioned vertically centered */}
      <div className="hidden lg:flex flex-col items-center lg:absolute lg:top-1/2 lg:left-8 lg:-translate-y-1/2">
        <TurnIndicator team="red" />
        <TeamPanel team="red" score={redScore} concealers={redConcealers} revealers={redRevealers} isMyTurn={currentTurn === 'red'} />
      </div>

      <div className="hidden lg:flex flex-col items-center lg:absolute lg:top-1/2 lg:right-8 lg:-translate-y-1/2">
        <TurnIndicator team="blue" />
        <TeamPanel team="blue" score={blueScore} concealers={blueConcealers} revealers={blueRevealers} isMyTurn={currentTurn === 'blue'} />
      </div>

      {/* Mobile / small screens: stack panels below the deck */}
      <div className="w-full flex flex-row gap-4 mt-4 lg:hidden justify-center px-4">
        <div className="flex flex-col items-center">
          <TurnIndicator team="red" />
          <TeamPanel team="red" score={redScore} concealers={redConcealers} revealers={redRevealers} isMyTurn={currentTurn === 'red'} />
        </div>
        <div className="flex flex-col items-center">
          <TurnIndicator team="blue" />
          <TeamPanel team="blue" score={blueScore} concealers={blueConcealers} revealers={blueRevealers} isMyTurn={currentTurn === 'blue'} />
        </div>
      </div>
    </JoinContext.Provider>
  );
};

export default Teams;
