import { useEffect, useState,useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clickCard, setPendingReveal, revealLocal } from "../store/slices/cardsSlice";
import { showOverlay, hideOverlay, setConfirmTarget, clearConfirmTarget } from "../store/slices/uiSlice";
import { updatePlayers } from "../store/slices/playersSlice";
import socket from "../socket";
import { DeckCard } from "./DeckCard";
import ThemeToggle from "./ThemeToggle";
import Teams from "./Teams";
import ClueInput from "./ClueInput";
import { useParams } from "react-router-dom";
import axios from "axios";
import { setCards } from "../store/slices/cardsSlice";
import { updateScores } from "../store/slices/scoreSlice";
const ANIMATION_DURATION = 600; // ms - match CSS animation length

const Deck = () => {
  const dispatch = useDispatch();
  const { gameId } = useParams();
  const cards = useSelector((state) => state.cards?.cards ?? []);
  const overlayActive = useSelector((state) => state.ui?.overlayActive ?? false);
  const confirmTargetId = useSelector((state) => state.ui?.confirmTargetId ?? null);
  const [joinedTeam, setJoinedTeam] = useState("");
  const [joinedTitle, setJoinedTitle] = useState("");
  const hasJoined = useRef(false);
  const handleTeamData=(team,title)=>{
    setJoinedTeam(team);
    setJoinedTitle(title);
    // inform server to add/update this player in the game's players list
    const nickname = localStorage.getItem('nickname') || 'Anonymous';
    console.log('➡️ Emitting joinTeam', { gameId, nickname, team, role: title });
    socket.emit('joinTeam', { gameId, nickname, team, role: title });
  }



  useEffect(() => {
    socket.on("receiveMessage", (data) => console.log("Received live message:", data));
    socket.on("clueReceived", (clueData) => {
      dispatch(showOverlay(clueData));
      setTimeout(() => dispatch(hideOverlay()), 3000);
    });
    return () => {
      socket.off("receiveMessage");
      socket.off("clueReceived");
    };
  }, [dispatch]);

  const handleClueSubmit = (clueData) => {
    dispatch(showOverlay(clueData));
    setTimeout(() => dispatch(hideOverlay()), 3000);
  };

  const onConfirmCardClick=(e,card)=>{
    e.stopPropagation();
    if (!card || card.revealed || card.pendingReveal) return;

    dispatch(setPendingReveal({ id: card.id, pending: true }));
    // reveal immediately (optimistic UI)
    setTimeout(() => {
      dispatch({ type: 'cards/revealLocal', payload: { id: card.id, revealed: true } });
      dispatch(clickCard({ id: card.id, word: card.word, team: card.team, gameId }));
      socket.emit("revealCard", { gameId, cardId: card.id }); 
      dispatch(clearConfirmTarget());
    }, ANIMATION_DURATION);
  };

  const onCardClick = (cardId) => {
    confirmTargetId === cardId ? dispatch(clearConfirmTarget()) : dispatch(setConfirmTarget(cardId));
  };


  useEffect(() => {
    async function fetchBoard() {
  try {
    const res = await axios.get(`http://localhost:3000/api/cards/${gameId}`);
    const normalized = (res.data.board || []).map((c, i) => ({
      // keep server _id if present, otherwise fallback to index
      id: c._id ?? i,
      word: c.word,
      team: c.type ?? c.team ?? 'neutral',   // map server "type" -> "team"
      revealed: c.revealed ?? false,
      // keep raw fields if you need them
      _raw: c,
    }));
    dispatch(setCards(normalized));
    
    // Initialize players from game document
    if (res.data.players) {
      dispatch(updatePlayers({ players: res.data.players }));
    }
  } catch (err) {
    console.error("Failed to fetch game:", err);
  }
}

    fetchBoard();
  }, [gameId, dispatch]);

  useEffect(() => {
    if (!gameId) return;
    if (hasJoined.current) return;
    hasJoined.current = true;


    console.log("➡️ Emitting joinGame for", gameId);
    socket.emit("joinGame", { gameId, nickname: localStorage.getItem("nickname") });

    const onJoined = (data) => console.log("✅ joinedGame ack:", data);
    const onPlayerJoined = (data) => console.log("👥 another player:", data);

    socket.on("joinedGame", onJoined);
    socket.on("playerJoined", onPlayerJoined);

    const onPlayersUpdated = ({ players }) => {
      console.log("🔁 players updated:", players);
      dispatch(updatePlayers({ players }));
    };

    const onJoinedTeamAck = ({ players }) => {
      console.log("🎯 joined team ack:", players);
      dispatch(updatePlayers({ players }));
    };

    socket.on("playersUpdated", onPlayersUpdated);
    socket.on("joinedTeamAck", onJoinedTeamAck);

    return () => {
      socket.off("joinedGame", onJoined);
      socket.off("playerJoined", onPlayerJoined);
      socket.off("playersUpdated", onPlayersUpdated);
      socket.off("joinedTeamAck", onJoinedTeamAck);
    };
  }, [gameId, dispatch]);

  useEffect(() => {
    socket.on("cardRevealed", ({ cardId,updated_score }) => {
      // Trigger animation on other participants' screens
      dispatch(setPendingReveal({ id: cardId, pending: true }));
      console.log(updated_score);
      dispatch(updateScores({
        red: updated_score.redScore,
        blue: updated_score.blueScore
      }));
      // After animation, reveal the card
      setTimeout(() => {
        dispatch(revealLocal({ id: cardId, revealed: true }));
      }, ANIMATION_DURATION);
    });

    return () => socket.off("cardRevealed");
  }, [dispatch]);


  return (
    <div className="relative w-screen h-screen flex items-center justify-center dark:bg-gradient-to-r dark:from-black dark:via-purple-950 dark:to-black bg-gradient-to-r from-indigo-200 via-white to-sky-200 overflow-hidden">
      <Teams onDataReceived={handleTeamData}/>
      <div className="flex flex-col items-center justify-center">
        <div className="p-6 gap-4 grid grid-rows-5 grid-cols-5 border-[1px] dark:border-white/10 rounded-[30px] w-[1100px] h-[750px] dark:bg-black/40 bg-white/40">
          {cards.map((card) => (
            <DeckCard
              key={card.id}
              word={card.word}
              team={card.team}
              click={() => onCardClick(card.id)}
              clickConfirm={(e)=> onConfirmCardClick(e,card)}
              confirmButton={confirmTargetId === card.id}
              revealed={joinedTitle === "Concealers" ? true : card.revealed}
              pending={card.pendingReveal}
            />
          ))}
        </div>
        <ClueInput onClueSubmit={handleClueSubmit} />
      </div>

      <ThemeToggle />

      {overlayActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 animate-fade">
          <h1 className="text-4xl font-bold text-white animate-pulse">Clue Submitted!</h1>
        </div>
      )}
    </div>
  );
};

export default Deck;
