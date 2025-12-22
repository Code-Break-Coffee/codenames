import { useEffect, useState,useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clickCard, setPendingReveal, revealLocal, resetAll } from "../store/slices/cardsSlice";
import { showOverlay, hideOverlay, showClueDisplay, hideClueDisplay, setConfirmTarget, clearConfirmTarget } from "../store/slices/uiSlice";
import { updatePlayers } from "../store/slices/playersSlice";
import { setCurrentTurn } from "../store/slices/gameSlice";
import socket from "../socket";
import { DeckCard } from "./DeckCard";
import ThemeToggle from "./ThemeToggle";
import Teams from "./Teams";
import ClueInput from "./ClueInput";
import TurnOverlay from "./TurnOverlay";
import TurnBadge from "./TurnBadge";
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
  const scores = useSelector((state) => state.scores ?? { red: 9, blue: 8 });
  const [joinedTeam, setJoinedTeam] = useState("");
  const [joinedTitle, setJoinedTitle] = useState("");
  const [finalWinner, setFinalWinner] = useState(null);
  const needsSpectatorUpdate = useRef(false);
  const hasJoined = useRef(false);
  const prevScoresRef = useRef(scores);
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
  // If the page is refreshed and the stored role was "Concealers",
  // clear the stored role and mark that we need to tell the server
  // this player should now be a spectator (so the players list updates).
  const prevTitle = localStorage.getItem('joinedTitle');
  const prevTeam = localStorage.getItem('joinedTeam');
  if (prevTitle === 'Concealers') {
    console.log("🧹 Detected stale 'Concealers' on refresh — will update server to spectator after join");
    needsSpectatorUpdate.current = true;
  }

  // Clear persisted join info (prevents concealer UI bleed-through)
  localStorage.removeItem('joinedTitle');
  localStorage.removeItem('joinedTeam');
  setJoinedTitle('');
  setJoinedTeam('');

  socket.on("connect", () => {
    console.log("🟢 Connected with socket ID:", socket.id);
    localStorage.setItem("socketId", socket.id);
  });

  return () => {
    socket.off("connect");
  };
}, []);


  useEffect(() => {
    // detect score hitting zero -> trigger win overlay, reveal all cards and show winner
    const prev = prevScoresRef.current || { red: Infinity, blue: Infinity };
    const now = scores;
    if (!prev) {
      prevScoresRef.current = now;
      return;
    }

    // Only trigger when a score *just* reached zero
    const redJustHitZero = prev.red > 0 && now.red === 0;
    const blueJustHitZero = prev.blue > 0 && now.blue === 0;

    if (redJustHitZero || blueJustHitZero) {
      const winner = redJustHitZero ? 'red' : 'blue';
      const WIN_OVERLAY_MS = 3500;

      // Set finalWinner immediately so turn switch handlers ignore follow-up overlays
      setFinalWinner(winner);

      // show the same overlay but as a win message
      dispatch(showOverlay({ turn: winner, isWin: true }));

      // after overlay finishes, hide overlay, reveal all cards and set final winner banner
      setTimeout(() => {
        dispatch(hideOverlay());
        // reveal all cards locally
        cards.forEach((c) => dispatch(revealLocal({ id: c.id, revealed: true })));
        setFinalWinner(winner);
      }, WIN_OVERLAY_MS);
    }

    prevScoresRef.current = now;
  }, [scores, cards, dispatch]);

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

useEffect(() => {
  async function fetchScores() {
    try {
      const res = await axios.get(`http://localhost:3000/api/score_and_turn/${gameId}`);
      dispatch(updateScores({
        red: res.data.redScore,
        blue: res.data.blueScore,
      }));
    } catch (err) {
      console.error("Failed to fetch scores", err);
    }
  }

  fetchScores();
}, []);

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
      // Clear any persisted reveal state immediately to avoid a flash
      // of colored/revealed cards from a previous session while we
      // fetch the actual board for this game.
      dispatch(resetAll());
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

    // If we detected that the client had been a Concealer before the refresh,
    // tell the server to mark this socket/player as a spectator now that we've
    // re-joined the game (server requires the player to exist first).
    const onJoinedWithSpectatorFix = (data) => {
      console.log("✅ joinedGame ack:", data);
      if (needsSpectatorUpdate.current && gameId) {
        const nickname = localStorage.getItem('nickname') || 'Anonymous';
        console.log("➡️ Emitting joinTeam -> spectator to update players list after refresh", { gameId, nickname });
        socket.emit('joinTeam', { gameId, nickname, team: 'spectator', role: 'spectator' });
        needsSpectatorUpdate.current = false;
      }
    };

  socket.on("joinedGame", onJoinedWithSpectatorFix);
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
      // If we've already declared a winner, ignore turn switch overlays
      if (finalWinner) return;
      console.log(`🔄 Turn switched to ${currentTurn}`);
      dispatch(setCurrentTurn(currentTurn));
      // Hide persistent clue display when turn switches
      dispatch(hideClueDisplay());
      // Show a brief turn overlay (reuses overlayActive/lastClue state)
      dispatch(showOverlay({ turn: currentTurn, isTurn: true }));
      // hide after the overlay component finishes its animation
      setTimeout(() => dispatch(hideOverlay()), 3500);
    });

    return () => {
      socket.off("cardRevealed");
      socket.off("turnSwitched");
    };
  }, [dispatch, finalWinner]);


  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center dark:bg-gradient-to-r dark:from-black dark:via-purple-950 dark:to-black bg-gradient-to-r from-indigo-200 via-white to-sky-200 overflow-hidden">
      <Teams onDataReceived={handleTeamData}/>
      {/* Persistent turn badge (shows from first render and updates on turn change) */}
      <TurnBadge />
      
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
              serverRevealed={card.revealed}
              concealerView={joinedTitle === "Concealers"}
              revealWordsOnGameOver={finalWinner != null}
            />
          ))}
        </div>
        
        {/* ClueInput or Revealer Display - Bottom */}
        <ClueInput onClueSubmit={handleClueSubmit}/>
        
        {/* Persistent clue display for Revealers - Bottom of deck
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
        )} */}
      </div>

      <ThemeToggle />

      {/* Brief overlay for brief clue announcement (Concealers, Spectators) */}
      {overlayActive && lastClue && (lastClue.isTurn || lastClue.isWin) ? (
        // Turn or Win overlay animates itself to the top; keep it separate component
        <TurnOverlay team={lastClue.turn} isWin={lastClue.isWin} onDone={() => dispatch(hideOverlay())} />
      ) : overlayActive && (
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
      {/* Final winner badge shown after reveal */}
      {finalWinner && (
        <div className="absolute left-1/2 -translate-x-1/2 top-6 z-40 pointer-events-none">
          <div className={`flex items-center gap-3 px-4 py-2 rounded-full shadow-lg text-white select-none ${finalWinner === 'red' ? 'bg-red-600' : 'bg-blue-600'}`}>
            <div className="w-3 h-3 rounded-full bg-white/80" />
            <div className="font-semibold tracking-wider">{finalWinner === 'red' ? 'Red Team Wins' : 'Blue Team Wins'}</div>
          </div>
        </div>
      )}
      </div>
    );
  };

  export default Deck;
