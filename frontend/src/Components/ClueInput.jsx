// ClueInput.jsx
import React, { useState } from 'react';

const ClueInput = () => {
  const [clueWord, setClueWord] = useState('');
  const [clueNumber, setClueNumber] = useState('1'); // Use string for select value
  
  // Array for number options
  const numbers = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6', label: '6' },
    { value: '7', label: '7' },
    { value: '8', label: '8' },
    { value: '9', label: '9' },
    { value: '10', label: '10' },
    { value: 'infinity', label: '∞' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    
    if (clueWord.trim() === '') {
      alert('Please enter a clue word!');
      return;
    }
    
    const numberDisplay = clueNumber === 'infinity' ? 'Infinity (∞)' : clueNumber;
    console.log(`Clue Submitted: "${clueWord}" for ${numberDisplay} cards.`);
    alert(`Clue Submitted: "${clueWord}" for ${numberDisplay} cards.`);
    
    // Reset state after submission
    setClueWord('');
    setClueNumber('1');
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="w-[1100px] mt-6 p-3 rounded-[30px] dark:bg-black/60 bg-white/70 shadow-2xl flex items-center space-x-3 border dark:border-white/10 border-gray-400 backdrop-blur-sm"
    >
      
      {/* Clue Word Input */}
      <input
        id="clue-word"
        type="text"
        value={clueWord}
        onChange={(e) => setClueWord(e.target.value)}
        placeholder="Your Clue"
        className="flex-grow p-3 rounded-xl border dark:border-gray-700 bg-input dark:bg-gray-800 text-foreground dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 placeholder:text-muted-foreground"
      />
      
      {/* Number Selector (Dropdown) */}
      <select
        value={clueNumber}
        onChange={(e) => setClueNumber(e.target.value)}
        className="py-3 px-3 rounded-xl bg-sidebar-accent dark:bg-sidebar-accent text-sidebar-accent-foreground dark:text-sidebar-accent-foreground font-bold cursor-pointer appearance-none outline-none border-2 border-transparent focus:border-primary transition-colors"
      >
        {numbers.map((num) => (
          <option key={num.value} value={num.value}>
            {num.label}
          </option>
        ))}
      </select>
      
      {/* Submit Button (using primary colors) */}
      <button 
        type="submit"
        className="h-12 w-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-opacity-90 transition-opacity duration-300 shadow-md disabled:opacity-50"
        disabled={clueWord.trim() === ''}
        title="Submit Clue"
      >
        {/* Up Arrow Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>
    </form>
  );
};

export default ClueInput;