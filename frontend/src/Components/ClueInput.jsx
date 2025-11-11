// ClueInput.jsx
import React, { useState,useEffect } from 'react';
import socket from '../socket';

const ClueInput = ({ onClueSubmit }) => {
  const [clueWord, setClueWord] = useState('');
  const [clueNumber, setClueNumber] = useState('1');
  const [submitted, setSubmitted] = useState(false);

  const numbers = Array.from({ length: 10 }, (_, i) => ({ value: `${i + 1}`, label: `${i + 1}` })).concat({ value: 'infinity', label: '∞' });

  useEffect(() => {
    const onClueReceived = (clueData) => {
      setClueWord(clueData.word);
      setClueNumber(clueData.number);
      setSubmitted(true);
    };
    socket.on('clueReceived', onClueReceived);
    return () => socket.off('clueReceived', onClueReceived);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (clueWord.trim() === '' || clueWord.trim().split(' ').length > 1) {
      alert('Please enter a single-word clue.');
      return;
    }

    const clueData = { word: clueWord, number: clueNumber };
    socket.emit('clueSubmitted', clueData);
    onClueSubmit?.(clueData);
  };

  return (
    <div className="w-[1100px] mt-6 p-4 rounded-[30px] dark:bg-black/60 bg-white/70 shadow-2xl flex items-center justify-center border dark:border-white/10 border-gray-400 backdrop-blur-sm">
      {!submitted ? (
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
      ) : (
        <div className="text-center text-2xl font-bold tracking-wide text-gray-900 dark:text-white">
          <span className="uppercase">{clueWord}</span>{" "}
          <span className="text-primary font-extrabold">({clueNumber === 'infinity' ? '∞' : clueNumber})</span>
        </div>
      )}
    </div>
  );
};

export default ClueInput;
