import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import socket from '../../socket';

// initial cards (same as your deck)
const initialCardsList = [
  { word: "Phoenix", team: "blue" },
  { word: "Dragon", team: "red" },
  { word: "Ocean", team: "blue" },
  { word: "Flame", team: "red" },
  { word: "Crystal", team: "blue" },
  { word: "Sunset", team: "red" },
  { word: "Arctic", team: "blue" },
  { word: "Mars", team: "red" },
  { word: "Neptune", team: "blue" },
  { word: "Volcano", team: "red" },
  { word: "Glacier", team: "blue" },
  { word: "Torch", team: "red" },
  { word: "Sapphire", team: "blue" },
  { word: "Ruby", team: "red" },
  { word: "River", team: "blue" },
  { word: "Ember", team: "red" },
  { word: "Frost", team: "blue" },
  { word: "Castle", team: "neutral" },
  { word: "Tower", team: "neutral" },
  { word: "Bridge", team: "neutral" },
  { word: "Garden", team: "neutral" },
  { word: "Pyramid", team: "neutral" },
  { word: "Temple", team: "neutral" },
  { word: "Mountain", team: "neutral" },
  { word: "Assassin", team: "assassin" },
];

const initialState = {
  cards: initialCardsList.map((c, i) => ({
    ...c,
    id: i,
    revealed: false,      // fully revealed (shows team color)
    pendingReveal: false, // animation in progress
  })),
  status: 'idle',
  error: null,
};

import API_URL from '../../apiConfig';

// thunk to perform network/socket work; call this after animation
export const clickCard = createAsyncThunk(
  'cards/clickCard',
  async ({ id, word, team, gameId }, { rejectWithValue }) => {
    try {
      // send the exact payload your server expects
      const res = await axios.post(`${API_URL}/api/click`, { gameId, word });

      // optionally use server response (res.data) if you want to sync board/scores
      socket.emit('sendMessage', { message: `${word} clicked`, team });
      return { id }; // keep existing reducer logic which marks the card revealed locally
    } catch (err) {
      console.error('clickCard error', err);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    setPendingReveal(state, action) {
      const { id, pending } = action.payload;
      const card = state.cards.find((c) => c.id === id);
      if (card) card.pendingReveal = pending;
    },
    revealLocal(state, action) {
      const { id, revealed = true } = action.payload;
      const card = state.cards.find((c) => c.id === id);
      if (card) {
        card.revealed = revealed;
        card.pendingReveal = false;
      }
    },
    resetAll(state) {
      state.cards.forEach((c) => {
        c.revealed = false;
        c.pendingReveal = false;
      });
    },
    setCards(state, action) {
      state.cards = action.payload.map((c, i) => ({
        ...c,
        id: i,
        revealed: c.revealed ?? false,
        pendingReveal: false
      }));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(clickCard.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(clickCard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { id } = action.payload;
        const card = state.cards.find((c) => c.id === id);
        if (card) {
          card.revealed = true;
          card.pendingReveal = false;
        }
      })
      .addCase(clickCard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
        // clear pending flags on fail (optional)
        // state.cards.forEach(c => (c.pendingReveal = false));
      });
  },
});

export const { setPendingReveal, revealLocal, resetAll, setCards } = cardsSlice.actions;
export default cardsSlice.reducer;
