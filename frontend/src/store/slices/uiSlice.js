import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  overlayActive: false,
  lastClue: null,
  clueDisplayActive: false, // New: persistent clue display for Revealers
  confirmTargetIds: [],
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
      // Do not clear lastClue here; keep the active clue in state so other
      // components (e.g., Deck for card selection) can still read it.
    },
    showClueDisplay: (state, action) => {
      state.clueDisplayActive = true;
      state.lastClue = action.payload || null;
    },
    hideClueDisplay: (state) => {
      state.clueDisplayActive = false;
      // Clear lastClue so Revealers don't keep an outdated clue after turn switches
      state.lastClue = null;
    },
    // Toggle a confirm target in the selection set
    toggleConfirmTarget: (state, action) => {
      const id = action.payload;
      if (id == null) return;
      // defensive: ensure confirmTargetIds is an array (may be undefined after
      // an older persisted state or if something else mutated the slice)
      if (!Array.isArray(state.confirmTargetIds)) state.confirmTargetIds = [];
      const idx = state.confirmTargetIds.indexOf(id);
      if (idx === -1) state.confirmTargetIds.push(id);
      else state.confirmTargetIds.splice(idx, 1);
    },
    // Remove an id from selection (used after confirming a card)
    removeConfirmTarget: (state, action) => {
      const id = action.payload;
      if (id == null) return;
      if (!Array.isArray(state.confirmTargetIds)) state.confirmTargetIds = [];
      state.confirmTargetIds = state.confirmTargetIds.filter((i) => i !== id);
    },
    // Clear all selections
    clearConfirmTargets: (state) => {
      state.confirmTargetIds = [];
    },
  },
});
export const {
  showOverlay,
  hideOverlay,
  showClueDisplay,
  hideClueDisplay,
  toggleConfirmTarget,
  removeConfirmTarget,
  clearConfirmTargets,
} = uiSlice.actions;
export default uiSlice.reducer;
