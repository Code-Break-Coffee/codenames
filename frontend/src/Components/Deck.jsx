import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clickCard, setPendingReveal, revealLocal, resetAll, updateCardClickedBy } from '../store/slices/cardsSlice';
import {
  showOverlay,
  hideOverlay,
  showClueDisplay,
  hideClueDisplay,
  toggleConfirmTarget,
  clearConfirmTargets,
} from '../store/slices/uiSlice';
import { updatePlayers } from '../store/slices/playersSlice';
import { setCurrentTurn } from '../store/slices/gameSlice';
import socket from '../socket';
import { DeckCard } from './DeckCard';
import AudioControl from './AudioControl';
import ThemeToggle from './ThemeToggle';
import Teams from './Teams';
import ClueInput from './ClueInput';
import TurnOverlay from './TurnOverlay';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../apiConfig';
import { setCards } from '../store/slices/cardsSlice';
import { updateScores } from '../store/slices/scoreSlice';
import TopGameControls from './TopGameControls';
import { useAudio } from '../context/AudioContext.jsx';
const ANIMATION_DURATION = 700; // ms - match CSS animation length

const Deck = () => {
  const { playSound, playBGM } = useAudio();
  const dispatch = useDispatch();
  const { gameId } = useParams();
  const cards = useSelector((state) => state.cards?.cards ?? []);
  const overlayActive = useSelector((state) => state.ui?.overlayActive ?? false);
  const lastClue = useSelector((state) => state.ui?.lastClue ?? null);
  const confirmTargetIds = useSelector((state) => state.ui?.confirmTargetIds ?? []);
  const currentTurn = useSelector((state) => state.game?.currentTurn ?? 'red');
  const scores = useSelector((state) => state.scores ?? { red: 9, blue: 8 });
  const [joinedTeam, setJoinedTeam] = useState('');
  const [joinedTitle, setJoinedTitle] = useState('');
  const [finalWinner, setFinalWinner] = useState(null);
  const navigate = useNavigate();
  const needsSpectatorUpdate = useRef(false);
  const hasJoined = useRef(false);
  // removed local single-click guard so player names are added to every card clicked
  const prevScoresRef = useRef(scores);
  // Responsive scaling refs for preserving deck proportion across devices
  const designWidth = 1100;
  const designHeight = 750;
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);
  const handleTeamData = (team, title) => {
    playBGM();
    setJoinedTeam(team);
    setJoinedTitle(title);
    // Store in localStorage so ClueInput can access it
    localStorage.setItem('joinedTeam', team);
    localStorage.setItem('joinedTitle', title);
    // inform server to add/update this player in the game's players list
    const nickname = localStorage.getItem('nickname') || 'Anonymous';
    console.log('➡️ Emitting joinTeam', { gameId, nickname, team, role: title });
    socket.emit('joinTeam', { gameId, nickname, team, role: title });
  };

  useEffect(() => {
    // If the page is refreshed and the stored role was "Concealers",
    // clear the stored role and mark that we need to tell the server
    // this player should now be a spectator (so the players list updates).
    const prevTitle = localStorage.getItem('joinedTitle');
    if (prevTitle === 'Concealers') {
      console.log("🧹 Detected stale 'Concealers' on refresh — will update server to spectator after join");
      needsSpectatorUpdate.current = true;
    }

    // Clear persisted join info (prevents concealer UI bleed-through)
    localStorage.removeItem('joinedTitle');
    localStorage.removeItem('joinedTeam');
    setJoinedTitle('');
    setJoinedTeam('');

    socket.on('connect', () => {
      console.log('🟢 Connected with socket ID:', socket.id);
      localStorage.setItem('socketId', socket.id);
    });

    return () => {
      // cleanup
      socket.off('connect');
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
      playSound('win');
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
    socket.on('receiveMessage', (data) => console.log('Received live message:', data));
    socket.on('clueReceived', (clueData) => {
      console.log('🎤 Deck received clueReceived:', clueData);
      // If server indicates the clue was cleared (turn switched), ensure we
      // hide any overlay or persistent revealer display and do not show an empty overlay.
      if (clueData && clueData.cleared) {
        try {
          dispatch(hideClueDisplay());
          dispatch(hideOverlay());
        } catch (err) {
          console.warn('Failed to hide clue display/overlay on cleared clue', err);
        }
        return;
      }

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
      socket.off('receiveMessage');
      socket.off('clueReceived');
    };
  }, [dispatch]);

  useEffect(() => {
    async function fetchScores() {
      try {
        const res = await axios.get(`${API_URL}/api/score_and_turn/${gameId}`);
        dispatch(
          updateScores({
            red: res.data.redScore,
            blue: res.data.blueScore,
          })
        );
      } catch (err) {
        console.error('Failed to fetch scores', err);
      }
    }

    fetchScores();
  }, []);

  const handleClueSubmit = (clueData) => {
    dispatch(showOverlay(clueData));
    setTimeout(() => dispatch(hideOverlay()), 3000);
  };

  const onConfirmCardClick = (e, card) => {
    e.stopPropagation();
    if (!card || card.revealed || card.pendingReveal) return;

    // Only Revealers can click cards
    if (joinedTitle !== 'Revealers') {
      console.warn('❌ Only Revealers can click cards');
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
      if (card.team === 'assassin') {
        playSound('lose');
      } else {
        playSound('cardReveal');
      }
      dispatch({ type: 'cards/revealLocal', payload: { id: card.id, revealed: true } });
      dispatch(clickCard({ id: card.id, word: card.word, team: card.team, gameId }));
      // Server will use socket.id to identify the revealer; no need to send socketId from client
      socket.emit('revealCard', { gameId, cardId: card.id });
      // clear all selected confirm buttons after a confirmation
      dispatch(clearConfirmTargets());
    }, ANIMATION_DURATION);
  };

  const onCardClick = (cardId) => {
    // Only Revealers can select cards
    if (joinedTitle !== 'Revealers') {
      console.warn('❌ Only Revealers can select cards');
      return;
    }

    // Check if it's this player's team turn
    if (joinedTeam !== currentTurn) {
      console.warn(`❌ It's ${currentTurn} team's turn, your team is ${joinedTeam}`);
      return;
    }

    // Require a clue to be present before Revealers may click.
    // Redux-only: rely on ui.lastClue populated by API hydration or socket.
    if (!lastClue || !lastClue.word) {
      console.warn('❌ Cannot select cards: no clue submitted yet');
      return;
    }

    playSound('cardClick');
    dispatch(toggleConfirmTarget(cardId));
    // Log which local player clicked and emit a UI-only selection event
    const myName = localStorage.getItem('nickname') || 'Anonymous';
    console.log(`➡️ [client] ${myName} selected cardId=${cardId}`);
    try {
      // Emit selection to server; include local nickname so the server
      // can insert it directly into the card.clickedBy list.
      socket.emit('cardClicked', { gameId, cardId, nickname: myName });
    } catch (err) {
      console.warn('Failed to emit cardClicked', err);
    }
  };

  useEffect(() => {
    async function fetchBoard() {
      // Clear any persisted reveal state immediately to avoid a flash
      // of colored/revealed cards from a previous session while we
      // fetch the actual board for this game.
      dispatch(resetAll());
      try {
        const res = await axios.get(`${API_URL}/api/cards/${gameId}`);
        const normalized = (res.data.board || []).map((c, i) => ({
          // keep server _id if present, otherwise fallback to index
          id: c._id ?? i,
          word: c.word,
          team: c.type ?? c.team ?? 'neutral', // map server "type" -> "team"
          revealed: c.revealed ?? false,
          clickedBy: c.clickedBy ?? [],
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

        // Fetch active clue from backend via dedicated endpoint so we can hydrate
        // clue UI even when a client reloads/rejoins.
        try {
          const clueRes = await axios.get(`${API_URL}/api/active_clue/${gameId}`);
          const activeClue = clueRes?.data?.activeClue;
          if (activeClue && activeClue.word) {
            const cluePayload = { word: activeClue.word, number: activeClue.number, gameId };
            // Always persist the active clue into UI state so other components
            // (like ClueInput) can reliably detect that a clue exists.
            dispatch(showClueDisplay(cluePayload));

            // Also persist in localStorage to guard against any Redux state
            // resets (e.g., hideOverlay clearing lastClue) so Revealers can
            // still select cards.
            try {
              localStorage.setItem('activeClueWord', String(activeClue.word || ''));
              localStorage.setItem('activeClueNumber', String(activeClue.number || '1'));
            } catch {}

            // Only show the brief overlay for non-Revealers.
            if (localStorage.getItem('joinedTitle') !== 'Revealers') {
              dispatch(showOverlay(cluePayload));
              setTimeout(() => dispatch(hideOverlay()), 1500);
            }
          } else {
            dispatch(hideClueDisplay());
          }
        } catch (e) {
          // If the endpoint fails, fall back to clearing clue UI to avoid stale state.
          dispatch(hideClueDisplay());
        }
      } catch (err) {
        console.error('Failed to fetch game:', err);
      }
    }

    fetchBoard();
  }, [gameId, dispatch]);

  // determine if this client is the creator/owner of the current game
  const isCreator = (() => {
    try {
      return localStorage.getItem(`createdGame_${gameId}`) === 'true';
    } catch {
      return false;
    }
  })();

  const handleStartNewGame = async () => {
    const nickname = localStorage.getItem('nickname') || 'Anonymous';
    try {
      if (gameId) {
        // reset the current game in-place for everyone
        const res = await axios.post(`${API_URL}/api/reset/${gameId}`, { nickname });
        // server emits 'gameReset' to the room; local handling will update state.
        // as a fallback, if server returned board, apply it immediately
        if (res && res.data && res.data.board) {
          const normalized = (res.data.board || []).map((c, i) => ({
            id: c._id ?? i,
            word: c.word,
            team: c.type ?? c.team ?? 'neutral',
            revealed: c.revealed ?? false,
            clickedBy: c.clickedBy ?? [],
            _raw: c,
          }));
          dispatch(setCards(normalized));
        }
      } else {
        // fallback: create a new game if no current gameId
        const res = await axios.post(`${API_URL}/api/generate`, { nickname });
        const newGameId = res.data.gameId;
        try {
          localStorage.setItem(`createdGame_${newGameId}`, 'true');
        } catch (err) {
          console.warn('Could not persist createdGame flag for new game', err);
        }
        navigate(`/game/${newGameId}`);
      }
    } catch (err) {
      console.error('Failed to start new game', err);
      alert('Could not start new game. Please try again.');
    }
  };

  useEffect(() => {
    if (!gameId) return;
    if (hasJoined.current) return;
    hasJoined.current = true;

    console.log('➡️ Emitting joinGame for', gameId);
    socket.emit('joinGame', { gameId, nickname: localStorage.getItem('nickname') });

    const onJoined = (data) => console.log('✅ joinedGame ack:', data);
    const onPlayerJoined = (data) => console.log('👥 another player:', data);

    // If we detected that the client had been a Concealer before the refresh,
    // tell the server to mark this socket/player as a spectator now that we've
    // re-joined the game (server requires the player to exist first).
    const onJoinedWithSpectatorFix = (data) => {
      console.log('✅ joinedGame ack:', data);
      if (needsSpectatorUpdate.current && gameId) {
        const nickname = localStorage.getItem('nickname') || 'Anonymous';
        console.log('➡️ Emitting joinTeam -> spectator to update players list after refresh', { gameId, nickname });
        socket.emit('joinTeam', { gameId, nickname, team: 'spectator', role: 'spectator' });
        needsSpectatorUpdate.current = false;
      }
    };

    socket.on('joinedGame', onJoinedWithSpectatorFix);
    socket.on('playerJoined', onPlayerJoined);

    const onPlayersUpdated = ({ players }) => {
      console.log('🔁 players updated:', players);
      dispatch(updatePlayers({ players }));
    };

    const onJoinedTeamAck = ({ players }) => {
      console.log('🎯 joined team ack:', players);
      dispatch(updatePlayers({ players }));
    };

    socket.on('playersUpdated', onPlayersUpdated);
    socket.on('joinedTeamAck', onJoinedTeamAck);

    return () => {
      socket.off('joinedGame', onJoined);
      socket.off('playerJoined', onPlayerJoined);
      socket.off('playersUpdated', onPlayersUpdated);
      socket.off('joinedTeamAck', onJoinedTeamAck);
    };
  }, [gameId, dispatch]);

  useEffect(() => {
    socket.on('cardRevealed', ({ cardId, updated_score }) => {
      // Trigger animation on other participants' screens
      dispatch(setPendingReveal({ id: cardId, pending: true }));
      console.log(updated_score);
      dispatch(
        updateScores({
          red: updated_score.redScore,
          blue: updated_score.blueScore,
        })
      );
      // After animation, reveal the card
      setTimeout(() => {
        const card = cards.find(c => c.id === cardId);
        if (card) {
          if (card.team === 'assassin') {
            playSound('lose');
          } else {
            playSound('cardReveal');
          }
        }
        dispatch(revealLocal({ id: cardId, revealed: true }));
      }, ANIMATION_DURATION);
    });

    // Handle server reset of the whole game (creator triggered)
    socket.on('gameReset', ({ board, currentTurn, redScore, blueScore, players }) => {
      try {
        // normalize board into client shape
        const normalized = (board || []).map((c, i) => ({
          id: c._id ?? i,
          word: c.word,
          team: c.type ?? c.team ?? 'neutral',
          revealed: c.revealed ?? false,
          clickedBy: c.clickedBy ?? [],
          _raw: c,
        }));

        dispatch(setCards(normalized));
        if (players) dispatch(updatePlayers({ players }));
        if (currentTurn) dispatch(setCurrentTurn(currentTurn));
        dispatch(
          updateScores({
            red: typeof redScore === 'number' ? redScore : 9,
            blue: typeof blueScore === 'number' ? blueScore : 8,
          })
        );
        // clear overlays and winner state
        try {
          dispatch(hideClueDisplay());
          dispatch(hideOverlay());
        } catch {
          console.log('');
        }
        setFinalWinner(null);
      // Reset any persisted clue UI on a fresh game
      dispatch(hideClueDisplay());
      dispatch(hideOverlay());
      } catch (err) {
        console.error('Failed to apply gameReset', err);
      }
    });

    socket.on('turnSwitched', ({ currentTurn }) => {
      // If we've already declared a winner, ignore turn switch overlays
      if (finalWinner) return;
      playSound('turnSwitch');
      console.log(`🔄 Turn switched to ${currentTurn}`);
      dispatch(setCurrentTurn(currentTurn));
      // Reset clickedBy for all cards locally so selection chips clear on turn change
      try {
        cards.forEach((c) => dispatch(updateCardClickedBy({ id: c.id, clickedBy: [] })));
      } catch (err) {
        console.warn('Failed to clear local clickedBy on turn switch', err);
      }
      // Reset local per-player clicked flag (client-side guard removed)
      // Hide persistent clue display when turn switches
      dispatch(hideClueDisplay());
      // Show a brief turn overlay (reuses overlayActive/lastClue state)
      dispatch(showOverlay({ turn: currentTurn, isTurn: true }));
      // hide after the overlay component finishes its animation
      setTimeout(() => dispatch(hideOverlay()), 3500);
    });

    // Listen for cardClicked updates so UI can show who selected a card immediately
    socket.on('cardClicked', ({ cardId, clickedBy }) => {
      dispatch(updateCardClickedBy({ id: cardId, clickedBy }));
      // Log the incoming info for debugging: who clicked which card
      console.log(`⬅️ [socket] cardClicked received cardId=${cardId} clickedBy=[${(clickedBy || []).join(', ')}]`);

      // Example: detect if a specific player clicked (change 'Alice' to the name you want to watch)
      const watchName = localStorage.getItem('watchPlayer') || null; // optional: set watchPlayer in localStorage
      const myName = localStorage.getItem('nickname') || 'Anonymous';
      if (clickedBy && clickedBy.includes(myName)) {
        console.log(`🔔 [info] You (${myName}) clicked card ${cardId}`);
      }
      if (watchName && clickedBy && clickedBy.includes(watchName)) {
        console.log(`🔎 [watch] ${watchName} clicked card ${cardId}`);
      }
    });

    // When server tells us all clickedBy lists were cleared on turn switch
    socket.on('clearAllClickedBy', () => {
      try {
        cards.forEach((c) => dispatch(updateCardClickedBy({ id: c.id, clickedBy: [] })));
      } catch (err) {
        console.warn('Failed to handle clearAllClickedBy', err);
      }
      // client-side single-click guard removed; nothing to reset here
    });

    // Server requests that persistent clue displays be cleared (e.g., on turn change)
    socket.on('clearClueDisplay', () => {
      try {
        dispatch(hideClueDisplay());
      } catch (err) {
        console.warn('Failed to handle clearClueDisplay', err);
      }
    });

    return () => {
      socket.off('cardRevealed');
      socket.off('turnSwitched');
      socket.off('cardClicked');
      socket.off('clearAllClickedBy');
      socket.off('clearClueDisplay');
    };
  }, [dispatch, finalWinner, cards]);

  // Measure wrapper and compute scale so deck content (including fonts/icons)
  // always preserves the original design proportions regardless of layout.
  useEffect(() => {
    const obsTarget = wrapperRef.current;
    if (!obsTarget) return;

    const compute = () => {
      const w = obsTarget.clientWidth || 0;
      const h = obsTarget.clientHeight || 0;
      if (!w || !h) return;
      const newScale = Math.max(0.45, Math.min(w / designWidth, h / designHeight));
      setScale(Number(newScale.toFixed(4)));
    };

    // ResizeObserver for container resizing
    const ro = new ResizeObserver(compute);
    ro.observe(obsTarget);

    // also compute initially
    compute();

    // listen to window resizes as well
    window.addEventListener('resize', compute);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, []);

  return (
    <>
      <div className="relative w-screen h-screen flex flex-col items-center justify-center dark:bg-gradient-to-r dark:from-black dark:via-purple-950 dark:to-black bg-gradient-to-r from-indigo-200 via-white to-sky-200 overflow-auto">
        {/* Persistent turn badge (shows from first render and updates on turn change) */}
        <TopGameControls isCreator={isCreator} onStartNewGame={handleStartNewGame} />

        <div className="deck flex flex-col items-center justify-center gap-4 w-full">
          <div
            ref={wrapperRef}
            className="flex flex-col items-center gap-4 w-[min(1100px,95vw)] lg:max-w-[calc(100vw-560px)]"
            style={{ maxHeight: 'calc(100vh - 160px)', height: `${designHeight * scale}px`, position: 'relative' }}
          >
            {/* Card Deck - Top (keeps exact design proportions by scaling inner content) */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: designWidth,
                height: designHeight,
                transform: `translate(-50%,-50%) scale(${scale})`,
                transformOrigin: 'center',
              }}
              className="p-6 gap-4 grid grid-rows-5 grid-cols-5 border-[1px] dark:border-white/10 rounded-[30px] dark:bg-black/40 bg-white/40"
            >
              {cards.map((card) => (
                <DeckCard
                  key={card.id}
                  word={card.word}
                  team={card.team}
                  clickedBy={card.clickedBy}
                  click={() => onCardClick(card.id)}
                  clickConfirm={(e) => onConfirmCardClick(e, card)}
                  confirmButton={confirmTargetIds.includes(card.id)}
                  revealed={joinedTitle === 'Concealers' ? true : card.revealed}
                  pending={card.pendingReveal}
                  serverRevealed={card.revealed}
                  concealerView={joinedTitle === 'Concealers'}
                  revealWordsOnGameOver={finalWinner != null}
                />
              ))}
            </div>
          </div>

          <Teams onDataReceived={handleTeamData} />

          {/* ClueInput or Revealer Display - Bottom */}
          <ClueInput onClueSubmit={handleClueSubmit} />

          {/* Persistent clue display for Revealers - Bottom of deck (kept hidden comment)
          {clueDisplayActive && lastClue && (
            <div style={{ width: '100%' }} className="p-4 rounded-[30px] dark:bg-black/60 bg-white/70 shadow-2xl flex items-center justify-center border dark:border-white/10 border-gray-400 backdrop-blur-sm">
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
      </div>

      <AudioControl />
      <ThemeToggle />

      {/* Brief overlay for brief clue announcement (Concealers, Spectators) */}
      {overlayActive && lastClue && (lastClue.isTurn || lastClue.isWin) ? (
        // Turn or Win overlay animates itself to the top; keep it separate component
        <TurnOverlay team={lastClue.turn} isWin={lastClue.isWin} onDone={() => dispatch(hideOverlay())} />
      ) : (
        overlayActive && (
          <>
            {lastClue ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 animate-fade">
                <div className="text-center">
                  <h2 className="text-5xl font-bold text-white mb-4 animate-pulse">
                    <span className="uppercase">{lastClue.word}</span>
                  </h2>
                  <p className="text-3xl font-extrabold text-primary">
                    {lastClue.number === 'infinity' ? '∞' : lastClue.number}
                  </p>
                </div>
              </div>
            ) : (
              <></>
            )}
          </>
        )
      )}
      {/* Final winner badge shown after reveal */}
      {finalWinner && (
        <div className="absolute left-1/2 -translate-x-1/2 top-6 z-40 pointer-events-none">
          <div
            className={`flex items-center gap-3 px-4 py-2 rounded-full shadow-lg text-white select-none ${finalWinner === 'red' ? 'bg-red-600' : 'bg-blue-600'}`}
          >
            <div className="w-3 h-3 rounded-full bg-white/80" />
            <div className="font-semibold tracking-wider">
              {finalWinner === 'red' ? 'Red Team Wins' : 'Blue Team Wins'}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Deck;
