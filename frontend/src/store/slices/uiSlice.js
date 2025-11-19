import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  overlayActive: false,
  lastClue: null,
  clueDisplayActive: false, // New: persistent clue display for Revealers
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showOverlay: (state, action) => {
      state.overlayActive = true;
      state.lastClue = action.payload || null;
    },
    hideOverlay: (state) => {
      state.overlayActive = false;
    },
    showClueDisplay: (state, action) => {
      state.clueDisplayActive = true;
      state.lastClue = action.payload || null;
    },
    hideClueDisplay: (state) => {
      state.clueDisplayActive = false;
    },
    setConfirmTarget: (state, action) => {
      state.confirmTargetId = action.payload ?? null;
    },
    clearConfirmTarget: (state) => {
      state.confirmTargetId = null;
    }
  },
});

export const { showOverlay, hideOverlay, showClueDisplay, hideClueDisplay, setConfirmTarget, clearConfirmTarget } = uiSlice.actions;
export default uiSlice.reducer;

