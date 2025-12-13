// ClueInput.jsx
import React, { useState,useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import socket from '../socket';

const ClueInput = ({ onClueSubmit }) => {
  const { gameId } = useParams();
  const [clueWord, setClueWord] = useState('');
  const [clueNumber, setClueNumber] = useState('1');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cardsRevealed, setCardsRevealed] = useState(0);
  // Read joined role/team directly from localStorage (synchronous, avoids timing issues)
  const joinedTitle = (typeof window !== 'undefined' && localStorage.getItem('joinedTitle')) || '';
  const joinedTeam = (typeof window !== 'undefined' && localStorage.getItem('joinedTeam')) || '';

  // Read persisted UI clue state so reloaded/rejoined revealers can still see it
  const ui = useSelector((state) => state.ui || {});

  // read currentTurn from the Redux store so we can restrict Concealer input to the active team
  const currentTurn = useSelector((state) => state.game?.currentTurn ?? 'red');

  const numbers = Array.from({ length: 10 }, (_, i) => ({ value: `${i + 1}`, label: `${i + 1}` })).concat({ value: 'infinity', label: '∞' });

  useEffect(() => {
    // If this client is a Revealer and there's a persisted clue, show it after reload/join
    try {
      const normalizedRoleLocal = String(joinedTitle || '').toLowerCase();
      const isRevealerLocal = normalizedRoleLocal.includes('reveal') || normalizedRoleLocal === 'revealer';
      if (!clueWord && isRevealerLocal && ui?.clueDisplayActive && ui?.lastClue) {
        setClueWord(ui.lastClue.word);
        setClueNumber(ui.lastClue.number);
        setIsSubmitted(true);
        setCardsRevealed(ui.lastClue.revealedCount || 0);
      }
    } catch (e) {
      // ignore
    }

    const onClueReceived = (clueData) => {
      console.log('📬 clueReceived:', clueData);
      setClueWord(clueData.word);
      setClueNumber(clueData.number);
  setIsSubmitted(true);
      setCardsRevealed(0); // Reset counter for new turn
    };
    socket.on('clueReceived', onClueReceived);

    // Listen for requestClue event to activate input for new Concealer
    const onRequestClue = ({ currentTurn }) => {
      // Only activate if this client is the Concealer for the new turn
      const normalizedRole = String(joinedTitle || '').toLowerCase();
      const normalizedTeam = String(joinedTeam || '').toLowerCase();
      const normalizedTurn = String(currentTurn || '').toLowerCase();
      const isRoleConcealer = normalizedRole.startsWith('conceal') || normalizedRole === 'spymaster';
      if (isRoleConcealer && normalizedTeam && normalizedTeam === normalizedTurn) {
  setIsSubmitted(false);
        setClueWord('');
        setClueNumber('1');
        setCardsRevealed(0);
      }
    };
    socket.on('requestClue', onRequestClue);

    // Listen for turnSwitched to clear previous clue for new Concealer
    const onTurnSwitched = ({ currentTurn }) => {
      const normalizedRole = String(joinedTitle || '').toLowerCase();
      const normalizedTeam = String(joinedTeam || '').toLowerCase();
      const normalizedTurn = String(currentTurn || '').toLowerCase();
      const isRoleConcealer = normalizedRole.startsWith('conceal') || normalizedRole === 'spymaster';
      if (isRoleConcealer && normalizedTeam && normalizedTeam === normalizedTurn) {
  setIsSubmitted(false);
        setClueWord('');
        setClueNumber('1');
        setCardsRevealed(0);
      }
    };
    socket.on('turnSwitched', onTurnSwitched);

    return () => {
      socket.off('clueReceived', onClueReceived);
      socket.off('requestClue', onRequestClue);
      socket.off('turnSwitched', onTurnSwitched);
    };
  }, [joinedTitle, joinedTeam]);

  useEffect(() => {
    const onCardRevealed = ({ cardsRevealedThisTurn }) => {
      console.log('🎯 Card revealed, count:', cardsRevealedThisTurn);
      setCardsRevealed(cardsRevealedThisTurn || 0);
      
      // Check if we've reached the clue number limit
      if (cardsRevealedThisTurn && clueNumber !== 'infinity' && cardsRevealedThisTurn >= parseInt(clueNumber)) {
        console.log(`✅ Clue limit reached! ${cardsRevealedThisTurn} cards revealed, switching turn...`);
  setIsSubmitted(false);
        setClueWord('');
        setClueNumber('1');
        setCardsRevealed(0);
        
        // Emit switchTurn event
        socket.emit('switchTurn', { gameId });
      }
    };
    socket.on('cardRevealed', onCardRevealed);
    return () => socket.off('cardRevealed', onCardRevealed);
  }, [clueNumber, gameId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (clueWord.trim() === '' || clueWord.trim().split(' ').length > 1) {
      alert('Please enter a single-word clue.');
      return;
    }

    const clueData = { word: clueWord, number: clueNumber, gameId };
    console.log('➡️ Emitting clueSubmitted:', clueData);
    socket.emit('clueSubmitted', clueData);
    onClueSubmit?.(clueData);
  };

  // Normalize and allow slight variations (e.g., 'Concealer', 'Concealers')
  const normalizedRole = String(joinedTitle || '').toLowerCase();
  const normalizedTeam = String(joinedTeam || '').toLowerCase();
  const normalizedTurn = String(currentTurn || '').toLowerCase();

  const isRoleConcealer = normalizedRole.startsWith('conceal') || normalizedRole === 'spymaster';
  const isConcealers = isRoleConcealer && normalizedTeam && normalizedTeam === normalizedTurn;



  return (
    <div>
  {!isSubmitted && isConcealers ? (
      <div className="w-[1100px] mt-6 p-4 rounded-[30px] dark:bg-black/60 bg-white/70 shadow-2xl flex items-center justify-center border dark:border-white/10 border-gray-400 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3 w-full justify-center">
          <input
            type="text"
            value={clueWord}
            onChange={(e) => setClueWord(e.target.value)}
            placeholder="Enter one-word clue"
            className="flex-grow p-3 rounded-xl border dark:border-gray-700 bg-input dark:bg-gray-800 text-foreground dark:text-white focus:ring-2 focus:ring-primary max-w-[400px]"
          />
          <select
            value={clueNumber}
            onChange={(e) => setClueNumber(e.target.value)}
            className="py-3 px-3 rounded-xl bg-sidebar-accent dark:bg-sidebar-accent text-sidebar-accent-foreground font-bold cursor-pointer"
          >
            {numbers.map((num) => (
              <option key={num.value} value={num.value}>{num.label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="h-12 w-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-opacity-90 transition-opacity duration-300 shadow-md"
            disabled={!clueWord.trim()}
            title="Submit Clue"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
        </form>
        </div>
      ) : (
        clueWord ? (
        <div className="text-center">
          <div className="text-2xl font-bold tracking-wide text-gray-900 dark:text-white mb-2">
            <span className="uppercase">{clueWord}</span>{" "}
            <span className="text-primary font-extrabold">({clueNumber === 'infinity' ? '∞' : clueNumber})</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {cardsRevealed} / {clueNumber === 'infinity' ? '∞' : clueNumber} cards revealed
          </div>
        </div>

        ) : (
          <></>
        )
      )}
        </div>
  );
};

export default ClueInput;
