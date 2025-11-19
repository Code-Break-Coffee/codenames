import { createSlice } from "@reduxjs/toolkit";

const playersSlice = createSlice({
  name: "players",
  initialState: {
    list: [] // Array of { socketId, name, team, role, _id }
  },
  reducers: {
    updatePlayers(state, action) {
      // action.payload should be { players: [...] } from server
      state.list = action.payload.players || [];
    }
  }
});

export const { updatePlayers } = playersSlice.actions;
export default playersSlice.reducer;
