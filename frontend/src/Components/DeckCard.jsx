import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { IoInformationCircle } from "react-icons/io5";
import { GiConfirmed } from "react-icons/gi";
import axios from 'axios';
export function DeckCard({ word, team, click, clickConfirm, confirmButton = false, revealed = false, pending = false, serverRevealed = false, concealerView = false, revealWordsOnGameOver = false, clickedBy = [] }) {
  const teamStyles = {
    red: {
      bg: 'bg-gradient-to-br from-red-700 via-red-800 to-red-900',
      border: 'border-red-400/30',
      shadow: 'shadow-xl shadow-red-500/40',
      glow: 'group-hover:shadow-red-500/50',
      text: 'text-white',
      shine: 'from-red-300/0 via-red-100/20 to-red-300/0'
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
      border: 'border-blue-400/30',
      shadow: 'shadow-xl shadow-blue-500/40',
      glow: 'group-hover:shadow-blue-500/50',
      text: 'text-white',
      shine: 'from-blue-300/0 via-blue-100/20 to-blue-300/0'
    },
    neutral: {
      bg: 'bg-gradient-to-br from-white via-gray-50 to-gray-100',
      border: 'border-gray-300/50',
      shadow: 'shadow-xl shadow-gray-400/40',
      glow: 'group-hover:shadow-gray-400/50',
      text: 'text-gray-900',
      shine: 'from-white/0 via-white/40 to-white/0'
    },
    assassin: {
      bg: 'bg-gradient-to-br from-gray-800 via-gray-900 to-black',
      border: 'border-gray-600/30',
      shadow: 'shadow-xl shadow-black/60',
      glow: 'group-hover:shadow-gray-600/70',
      text: 'text-white',
      shine: 'from-gray-400/0 via-gray-300/15 to-gray-400/0'
    }
  };

  const defaultStyle = {
    bg: 'bg-gradient-to-br from-amber-100 via-amber-50 to-yellow-50 dark:from-amber-900/40 dark:via-amber-800/30 dark:to-yellow-900/40',
    border: 'border-amber-200/50 dark:border-amber-700/30',
    shadow: 'shadow-xl shadow-amber-200/40 dark:shadow-amber-900/40',
    glow: 'group-hover:shadow-amber-300/50 dark:group-hover:shadow-amber-800/50',
    text: 'text-amber-900 dark:text-amber-100',
    shine: 'from-amber-200/0 via-amber-100/40 to-amber-200/0 dark:from-amber-700/0 dark:via-amber-600/20 dark:to-amber-700/0'
  };

  let style;
  if (revealed) {
    style = teamStyles[team];
    if (!style) {
      console.warn(`DeckCard: Unknown or missing team '${team}' for word '${word}'. Using fallback style.`);
      style = defaultStyle;
    }
  } else {
    style = defaultStyle;
  }

  // classes for animation
  const animClass = pending ? 'animate-card-flip' : '';
  const revealedClass = revealed ? 'revealed-card' : '';

  const [response, setResponse] = useState("");

  const handleInfoClick = async (e) => {
    // prevent bubbling to card click
    e.stopPropagation();
    const url = 'https://en.wikipedia.org/api/rest_v1/page/summary/'+word;
    try {
      const res = await axios.get(url);
      setResponse(res.data.extract);
    } catch (err) {
      console.error('❌ Axios GET error:', err);
    }
  };

  return (
    <div className={`group relative w-full h-full ${animClass} ${revealedClass}`} onClick={click}>
        <IoInformationCircle onClick={(e)=>handleInfoClick(e)} className='absolute top-[5px] left-[5px] text-[30px] z-30 text-gray-800 dark:text-white opacity-90 hover:cursor-pointer' />
      {
        // If someone has clicked this card, show up to two inline chips.
        // If more than two players clicked, show an overflow chip with "..."
        // and reveal a hover panel listing all names.
        clickedBy && clickedBy.length > 0 ? (
          <div className='absolute top-2 right-2 z-20 flex items-center gap-1 max-w-[55%] pr-1'>
            {
              (() => {
                const maxVisible = 1;
                const visible = clickedBy.slice(0, maxVisible);
                const extra = clickedBy.length - visible.length;
                return (
                  <div className='relative group'>
                    <div className='flex items-center gap-1'>
                      {visible.map((name, idx) => (
                        <div
                          key={idx}
                          className='inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-semibold bg-white/90 dark:bg-black/80 text-gray-800 dark:text-gray-100 shadow'
                          title={name}
                        >
                          {name.length > 18 ? name.slice(0, 15) + '…' : name}
                        </div>
                      ))}
                      {extra > 0 ? (
                        <div className='inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-semibold bg-white/90 dark:bg-black/80 text-gray-800 dark:text-gray-100 shadow'>
                          …
                        </div>
                      ) : null}
                    </div>

                    {/* Hover panel showing full list of names (shows when hovering the chips) */}
                    <div className='opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 transform scale-95 group-hover:scale-100 absolute right-0 mt-2 w-max max-w-xs'>
                      <div className='bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-2 text-xs'>
                        {clickedBy.map((n, i) => (
                          <div key={i} className='py-0.5 px-1 truncate'>{n}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()
            }
          </div>
        ) : null
      }
      {/* background glow (kept) */}
      <div className={`absolute -inset-1 ${style.bg} rounded-[10px] blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
      <div
        className={`
          relative w-full h-full rounded-[10px] border-2
          transform transition-all duration-500 ease-out
          hover:scale-105 hover:-translate-y-1
          cursor-pointer overflow-hidden
          ${style.bg} ${style.border} ${style.text}
          ${style.shadow} ${style.glow}
        `}
      >
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 48%, currentColor 48%, currentColor 52%, transparent 52%),
                linear-gradient(-45deg, transparent 48%, currentColor 48%, currentColor 52%, transparent 52%)
              `,
              backgroundSize: '20px 20px'
            }}
          />
        </div>

        {/* Corner accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-current opacity-30 rounded-tl" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-current opacity-30 rounded-br" />

        {/* Top gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/20" />

        {/* Word content */}
        <div className="relative h-full flex items-center justify-center p-3">
          <span
            className="uppercase tracking-widest drop-shadow-lg text-center"
            style={{ 
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: '800',
              letterSpacing: '0.1em',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}
          >
            {concealerView && serverRevealed && !revealWordsOnGameOver ? (
              // Concealers: normally erase word text for cards that were revealed by Revealers
              <span className="opacity-0">{word}</span>
            ) : (
              word
            )}
          </span>
        {/* Meaning modal (renders into document.body so it's not clipped by card) */}
        {
          response ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={()=>setResponse('')}>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <div className="relative w-full max-w-2xl max-h-[70vh] overflow-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-4" onClick={(e)=>e.stopPropagation()}>
                <div className="flex items-start justify-between mb-2">
                  <strong className="text-sm">Meaning</strong>
                  <button
                    aria-label="Close meaning"
                    className="ml-3 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                    onClick={()=>setResponse('')}
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{response}</p>
              </div>
            </div>,
            document.body
          ) : null
        }
        {/* Word content */}
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-700">
          <div className={`absolute inset-0 bg-gradient-to-r ${style.shine} translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12`} />
        </div>

        {/* Bottom highlight */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Confirm tick button (revealer confirmation) */}
        {/* Show confirm button only when confirmButton is true and the card
            has NOT been revealed on the server (serverRevealed=false). Also
            make the button smaller so it doesn't visually dominate the card. */}
        {confirmButton && !serverRevealed ? (
          <button
            onClick={(e) => { e.stopPropagation(); if (typeof clickConfirm === 'function') clickConfirm(e); }}
            title="Confirm reveal"
            className="absolute bottom-2 right-2 z-40 inline-flex items-center justify-center w-7 h-7 rounded-full bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-50"
          >
            <GiConfirmed className="w-4 h-4 text-green-600" />
          </button>
        ) : null}

        {/* Vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] rounded-[10px] pointer-events-none" />
      </div>
    </div>
  );
}
