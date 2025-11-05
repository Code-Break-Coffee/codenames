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
  },
});

export const { showOverlay, hideOverlay } = uiSlice.actions;
export default uiSlice.reducer;
