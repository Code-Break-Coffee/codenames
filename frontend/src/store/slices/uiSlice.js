import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  overlayActive: false,
  lastClue: null,
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
    setConfirmTarget: (state, action) => {
      state.confirmTargetId = action.payload ?? null;
    },
    clearConfirmTarget: (state) => {
      state.confirmTargetId = null;
    }
  },
});

export const { showOverlay, hideOverlay, setConfirmTarget, clearConfirmTarget } = uiSlice.actions;
export default uiSlice.reducer;
