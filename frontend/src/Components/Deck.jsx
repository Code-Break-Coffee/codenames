import { useEffect, useState,useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clickCard, setPendingReveal, revealLocal } from "../store/slices/cardsSlice";
import { showOverlay, hideOverlay, showClueDisplay, hideClueDisplay, setConfirmTarget, clearConfirmTarget } from "../store/slices/uiSlice";
import { updatePlayers } from "../store/slices/playersSlice";
import { setCurrentTurn } from "../store/slices/gameSlice";
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
  const clueDisplayActive = useSelector((state) => state.ui?.clueDisplayActive ?? false);
  const lastClue = useSelector((state) => state.ui?.lastClue ?? null);
  const confirmTargetId = useSelector((state) => state.ui?.confirmTargetId ?? null);
  const currentTurn = useSelector((state) => state.game?.currentTurn ?? "red");
  const [joinedTeam, setJoinedTeam] = useState("");
  const [joinedTitle, setJoinedTitle] = useState("");
  const hasJoined = useRef(false);
  const handleTeamData=(team,title)=>{
    setJoinedTeam(team);
    setJoinedTitle(title);
    // Store in localStorage so ClueInput can access it
    localStorage.setItem('joinedTeam', team);
    localStorage.setItem('joinedTitle', title);
    // inform server to add/update this player in the game's players list
    const nickname = localStorage.getItem('nickname') || 'Anonymous';
    console.log('➡️ Emitting joinTeam', { gameId, nickname, team, role: title });
    socket.emit('joinTeam', { gameId, nickname, team, role: title });
  }

useEffect(() => {
  socket.on("connect", () => {
    console.log("🟢 Connected with socket ID:", socket.id);
    localStorage.setItem("socketId", socket.id);
  });

  return () => {
    socket.off("connect");
  };
}, []);


  useEffect(() => {
    socket.on("receiveMessage", (data) => console.log("Received live message:", data));
    socket.on("clueReceived", (clueData) => {
      console.log('🎤 Deck received clueReceived:', clueData);
      // For Revealers, show persistent display
      // For others, show brief overlay
      if (localStorage.getItem('joinedTitle') === 'Revealers') {
        dispatch(showClueDisplay(clueData));
      } else {
        dispatch(showOverlay(clueData));
        setTimeout(() => dispatch(hideOverlay()), 3000);
      }
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

    // Only Revealers can click cards
    if (joinedTitle !== "Revealers") {
      console.warn("❌ Only Revealers can click cards");
      return;
    }

    // Check if it's this player's team turn
    if (joinedTeam !== currentTurn) {
      console.warn(`❌ It's ${currentTurn} team's turn, your team is ${joinedTeam}`);
      return;
    }

    dispatch(setPendingReveal({ id: card.id, pending: true }));
    // reveal immediately (optimistic UI)
    setTimeout(() => {
      dispatch({ type: 'cards/revealLocal', payload: { id: card.id, revealed: true } });
      dispatch(clickCard({ id: card.id, word: card.word, team: card.team, gameId }));
      socket.emit("revealCard", { gameId, cardId: card.id,socketId:localStorage.getItem("socketId") }); 
      dispatch(clearConfirmTarget());
    }, ANIMATION_DURATION);
  };

  const onCardClick = (cardId) => {
    // Only Revealers can select cards
    if (joinedTitle !== "Revealers") {
      console.warn("❌ Only Revealers can select cards");
      return;
    }
    
    // Check if it's this player's team turn
    if (joinedTeam !== currentTurn) {
      console.warn(`❌ It's ${currentTurn} team's turn, your team is ${joinedTeam}`);
      return;
    }
    
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

    // Initialize currentTurn from game document
    if (res.data.currentTurn) {
      dispatch(setCurrentTurn(res.data.currentTurn));
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

    socket.on("turnSwitched", ({ currentTurn }) => {
      console.log(`🔄 Turn switched to ${currentTurn}`);
      dispatch(setCurrentTurn(currentTurn));
      // Hide persistent clue display when turn switches
      dispatch(hideClueDisplay());
    });

    return () => {
      socket.off("cardRevealed");
      socket.off("turnSwitched");
    };
  }, [dispatch]);


  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center dark:bg-gradient-to-r dark:from-black dark:via-purple-950 dark:to-black bg-gradient-to-r from-indigo-200 via-white to-sky-200 overflow-hidden">
      <Teams onDataReceived={handleTeamData}/>
      
      <div className="flex flex-col items-center justify-center gap-4">
        {/* Card Deck - Top */}
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
        
        {/* ClueInput or Revealer Display - Bottom */}
        <ClueInput onClueSubmit={handleClueSubmit} />
        
        {/* Persistent clue display for Revealers - Bottom of deck */}
        {clueDisplayActive && lastClue && (
          <div className="w-[1100px] p-4 rounded-[30px] dark:bg-black/60 bg-white/70 shadow-2xl flex items-center justify-center border dark:border-white/10 border-gray-400 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold tracking-widest mb-2">REVEALER'S CLUE</p>
              <div className="text-2xl font-bold tracking-wide text-gray-900 dark:text-white">
                <span className="uppercase">{lastClue.word}</span>{" "}
                <span className="text-primary font-extrabold">({lastClue.number === 'infinity' ? '∞' : lastClue.number})</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <ThemeToggle />

      {/* Brief overlay for brief clue announcement (Concealers, Spectators) */}
      {overlayActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 animate-fade">
          {lastClue ? (
            <div className="text-center">
              <h2 className="text-5xl font-bold text-white mb-4 animate-pulse">
                <span className="uppercase">{lastClue.word}</span>
              </h2>
              <p className="text-3xl font-extrabold text-primary">
                {lastClue.number === 'infinity' ? '∞' : lastClue.number}
              </p>
            </div>
          ) : (
            <h1 className="text-4xl font-bold text-white animate-pulse">Clue Submitted!</h1>
          )}
        </div>
      )}
    </div>
  );
};

export default Deck;
