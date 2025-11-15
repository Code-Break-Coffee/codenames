import { createSlice } from "@reduxjs/toolkit";

const scoreSlice = createSlice({
  name: "scores",
  initialState: { red: 9, blue: 8 },
  reducers: {
    updateScores(state, action) {
      // Accepts either {red, blue} or {redScore, blueScore}
      if (typeof action.payload.red !== 'undefined' && typeof action.payload.blue !== 'undefined') {
        state.red = action.payload.red;
        state.blue = action.payload.blue;
      } else {
        state.red = action.payload.redScore;
        state.blue = action.payload.blueScore;
      }
    }
  }
});

export const { updateScores } = scoreSlice.actions;
export default scoreSlice.reducer;
