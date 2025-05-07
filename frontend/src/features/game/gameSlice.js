import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createPlayer, fetchPlayerById } from './gameApi';

const initialState = {
  playerId:null,
  amount:null,
  status: 'idle',
};


export const fetchPlayerByIdAsync = createAsyncThunk(
  'game/fetchPlayerById',
  async (id) => {
    const response = await fetchPlayerById(id);
    return response.data;
  }
);

export const createPlayerAsync = createAsyncThunk(
    'game/createPlayer',
    async (id) => {
      const response = await createPlayer(id);
      return response.data;
    }
  );

export const gameSlice   = createSlice({
  name: 'game',
  initialState,
  reducers: {
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlayerByIdAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPlayerByIdAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.playerId = action.payload.playerId;
        state.amount = action.payload.amount
      });
  },
});


export const selectPLayerId = (state) => state.game.playerId
export const selectAmount = (state) => state.game.amount


export default gameSlice.reducer;
