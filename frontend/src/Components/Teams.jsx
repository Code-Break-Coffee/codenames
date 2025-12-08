import { createContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import TeamPanel from "./TeamPanel";
import axios from "axios";


export const JoinContext = createContext();

const Teams = ({ onDataReceived }) => {
  const { gameId } = useParams();   // <-- GET GAME ID FROM URL

  const [joinedTeam, setJoinedTeam] = useState("");
  const [joinedTitle, setJoinedTitle] = useState("");

  const [allPlayers, setAllPlayers] = useState([]);  // From API

  const handleJoin = (teamJoin, titleJoin) => {
    setJoinedTeam(teamJoin);
    setJoinedTitle(titleJoin);
    onDataReceived(teamJoin, titleJoin);
  };

  // Fetch players automatically
  useEffect(() => {
    if (!gameId) return;

    const fetchPlayers = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/players/${gameId}`);
        setAllPlayers(res.data.players || []);
      } catch (err) {
        console.error("Failed to load players", err);
      }
    };

    fetchPlayers();

    // Auto refresh players every 1.5 sec
    const interval = setInterval(fetchPlayers, 5500);
    return () => clearInterval(interval);

  }, [gameId]);

  // Filter players
  const redConcealers = allPlayers.filter(p => p.team === "red" && p.role === "Concealers").map(p => p.name);
  const redRevealers = allPlayers.filter(p => p.team === "red" && p.role === "Revealers").map(p => p.name);

  const blueConcealers = allPlayers.filter(p => p.team === "blue" && p.role === "Concealers").map(p => p.name);
  const blueRevealers = allPlayers.filter(p => p.team === "blue" && p.role === "Revealers").map(p => p.name);

  // Read persisted/Redux scores and fall back to 0 if shape varies
  const scoresState = useSelector(state => state.scores || {});
  const redScore = scoresState?.red ?? scoresState?.redScore ?? scoresState?.red_team ?? scoresState?.redTeam ?? 0;
  const blueScore = scoresState?.blue ?? scoresState?.blueScore ?? scoresState?.blue_team ?? scoresState?.blueTeam ?? 0;

  return (
    <JoinContext.Provider value={{
      teamInfo: [joinedTeam, setJoinedTeam],
      titleInfo: [joinedTitle, setJoinedTitle],
      handleJoin
    }}>
      <div className="absolute top-[50%] left-8 translate-y-[-50%]">
        <TeamPanel team="red" score={redScore} concealers={redConcealers} revealers={redRevealers}/>
      </div>

      <div className="absolute top-[50%] right-8 translate-y-[-50%]">
        <TeamPanel team="blue" score={blueScore} concealers={blueConcealers} revealers={blueRevealers}/>
      </div>
    </JoinContext.Provider>
  );
};

export default Teams;