import { createSlice } from '@reduxjs/toolkit';

const gameSlice = createSlice({
  name: 'game',
  initialState: {
    currentTurn: 'red', // "red" or "blue"
  },
  reducers: {
    setCurrentTurn(state, action) {
      state.currentTurn = action.payload;
    },
  },
});

export const { setCurrentTurn } = gameSlice.actions;
export default gameSlice.reducer;
