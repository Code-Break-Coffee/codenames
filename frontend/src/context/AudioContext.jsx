import { createContext, useContext, useState, useMemo, useCallback, useRef, useEffect } from 'react';

import bgmSound from '../assets/bgm.mp3';
import cardClickSound from '../assets/card_click.wav';
import cardRevealSound from '../assets/card_reveal.wav';
import turnSwitchSound from '../assets/turn_switch.wav';
import winSound from '../assets/win.wav';
import loseSound from '../assets/lose.wav';

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

const sounds = {
  cardClick: new Audio(cardClickSound),
  cardReveal: new Audio(cardRevealSound),
  turnSwitch: new Audio(turnSwitchSound),
  win: new Audio(winSound),
  lose: new Audio(loseSound),
};

Object.values(sounds).forEach((sound) => {
  sound.load();
  sound.volume = 0.2;
});

export const AudioProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [bgmStarted, setBgmStarted] = useState(false);
  const bgmRef = useRef(null);

  useEffect(() => {
    if (!bgmRef.current) {
      bgmRef.current = new Audio(bgmSound);
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.1;
    }
  }, []);

  const playBGM = useCallback(() => {
    if (!isMuted && bgmRef.current) {
      bgmRef.current.play().catch((error) => {
        console.warn('BGM autoplay was prevented.', error);
      });
      setBgmStarted(true);
    }
  }, [isMuted]);

  useEffect(() => {
    if (bgmRef.current) {
      if (isMuted) {
        bgmRef.current.pause();
      } else {
        if (bgmRef.current.paused && bgmStarted) {
          // If BGM was paused due to mute, resume it.
          // This will not start it on initial load.
          bgmRef.current.play().catch((e) => console.warn('BGM resume failed', e));
        }
      }
    }
  }, [isMuted, bgmStarted]);

  const playSound = useCallback((soundName) => {
    if (sounds[soundName]) {
      sounds[soundName].currentTime = 0;
      sounds[soundName].play().catch((error) => console.warn(`Sound ${soundName} failed to play:`, error));
    }
  }, []);

  const value = useMemo(
    () => ({
      isMuted,
      setIsMuted,
      playSound,
      playBGM,
    }),
    [isMuted, playSound, playBGM]
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};
