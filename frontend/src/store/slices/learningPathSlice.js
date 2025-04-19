import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import RutaService from '../../services/RutaService';
import { setMessage } from './messageSlice';

// Estado inicial
const initialState = {
  currentPath: null,
  loading: false,
  error: null
};

// Acción asíncrona para obtener ruta de aprendizaje
export const fetchLearningPath = createAsyncThunk(
  'learningPath/fetchLearningPath',
  async ({ userId, materiaId }, thunkAPI) => {
    try {
      const response = await RutaService.getRuta(userId, materiaId);
      return response.data.ruta;
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

// Acción asíncrona para crear/actualizar ruta de aprendizaje
export const updateLearningPath = createAsyncThunk(
  'learningPath/updateLearningPath',
  async ({ userId, materiaId, data }, thunkAPI) => {
    try {
      const response = await RutaService.crearOActualizarRuta(userId, materiaId, data);
      thunkAPI.dispatch(setMessage('Ruta de aprendizaje actualizada correctamente'));
      return response.data.ruta;
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

// Acción asíncrona para actualizar estado de módulo
export const updateModuleStatus = createAsyncThunk(
  'learningPath/updateModuleStatus',
  async ({ userId, materiaId, moduloOrden, completado }, thunkAPI) => {
    try {
      const response = await RutaService.actualizarEstadoModulo(
        userId,
        materiaId,
        moduloOrden,
        completado
      );
      return {
        ruta: response.data.ruta,
        moduloOrden,
        completado
      };
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
const learningPathSlice = createSlice({
  name: 'learningPath',
  initialState,
  reducers: {
    startModule: (state, action) => {
      // Marcar un módulo como iniciado (sin completar)
      const moduleId = action.payload;
      if (state.currentPath && state.currentPath.modulos) {
        const modulo = state.currentPath.modulos.find(m => m.orden === moduleId);
        if (modulo) {
          modulo.iniciado = true;
        }
      }
    },
    completeModule: (state, action) => {
      // Marcar un módulo como completado
      const moduleId = action.payload;
      if (state.currentPath && state.currentPath.modulos) {
        const modulo = state.currentPath.modulos.find(m => m.orden === moduleId);
        if (modulo) {
          modulo.logrado = true;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Obtener ruta de aprendizaje
      .addCase(fetchLearningPath.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLearningPath.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPath = action.payload;
      })
      .addCase(fetchLearningPath.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Actualizar ruta de aprendizaje
      .addCase(updateLearningPath.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLearningPath.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPath = action.payload;
      })
      .addCase(updateLearningPath.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Actualizar estado de módulo
      .addCase(updateModuleStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateModuleStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentPath && state.currentPath.modulos) {
          const modulo = state.currentPath.modulos.find(
            m => m.orden === action.payload.moduloOrden
          );
          if (modulo) {
            modulo.logrado = action.payload.completado;
          }
        }
      })
      .addCase(updateModuleStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { startModule, completeModule } = learningPathSlice.actions;
export default learningPathSlice.reducer;