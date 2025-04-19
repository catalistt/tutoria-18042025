import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import GamificationService from '../../services/GamificationService';
import { setMessage } from './messageSlice';

// Estado inicial
const initialState = {
  userGamification: null,
  badges: [],
  challenges: [],
  rewards: [],
  loading: false,
  error: null
};

// Acción asíncrona para obtener datos de gamificación
export const fetchGamification = createAsyncThunk(
  'gamification/fetchGamification',
  async (userId, thunkAPI) => {
    try {
      const response = await GamificationService.getUserGamification(userId);
      return response.data.gamificacion;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
        
      thunkAPI.dispatch(setMessage(message));
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Acción asíncrona para actualizar racha diaria
export const updateStreak = createAsyncThunk(
  'gamification/updateStreak',
  async (userId, thunkAPI) => {
    try {
      const response = await GamificationService.actualizarRacha(userId);
      return response.data.gamificacion;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
        
      thunkAPI.dispatch(setMessage(message));
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Acción asíncrona para completar un desafío
export const completeChallenge = createAsyncThunk(
  'gamification/completeChallenge',
  async ({ userId, desafioId }, thunkAPI) => {
    try {
      const response = await GamificationService.completarDesafio(userId, desafioId);
      thunkAPI.dispatch(setMessage('¡Desafío completado!'));
      return response.data.gamificacion;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
        
      thunkAPI.dispatch(setMessage(message));
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Acción asíncrona para comprar una recompensa
export const purchaseReward = createAsyncThunk(
  'gamification/purchaseReward',
  async ({ userId, recompensaId }, thunkAPI) => {
    try {
      const response = await GamificationService.comprarRecompensa(userId, recompensaId);
      thunkAPI.dispatch(setMessage('¡Recompensa desbloqueada!'));
      return response.data.gamificacion;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
        
      thunkAPI.dispatch(setMessage(message));
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Slice
const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Obtener datos de gamificación
      .addCase(fetchGamification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGamification.fulfilled, (state, action) => {
        state.loading = false;
        state.userGamification = action.payload;
        state.badges = action.payload.insignias || [];
        state.challenges = action.payload.desafios || [];
        state.rewards = action.payload.recompensasDisponibles || [];
      })
      .addCase(fetchGamification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Actualizar racha diaria
      .addCase(updateStreak.fulfilled, (state, action) => {
        state.userGamification = action.payload;
      })
      // Completar desafío
      .addCase(completeChallenge.fulfilled, (state, action) => {
        state.userGamification = action.payload;
        state.challenges = action.payload.desafios || [];
      })
      // Comprar recompensa
      .addCase(purchaseReward.fulfilled, (state, action) => {
        state.userGamification = action.payload;
        state.rewards = action.payload.recompensasDisponibles || [];
      });
  },
});

export default gamificationSlice.reducer;