import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import SesionService from '../../services/SesionService';
import { setMessage } from './messageSlice';

// Estado inicial
const initialState = {
  currentSession: null,
  answers: [],
  loading: false,
  error: null,
  stats: {
    questionsTotal: 0,
    questionsCorrect: 0,
    averageResponseTime: 0,
    accuracy: 0
  }
};

// Acción asíncrona para crear sesión
export const startSession = createAsyncThunk(
  'session/startSession',
  async ({ userId, materiaId, tipo }, thunkAPI) => {
    try {
      const response = await SesionService.crearSesion({
        usuarioId: userId,
        materiaId,
        tipo
      });
      return response.data.sesion;
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

// Acción asíncrona para finalizar sesión
export const endSession = createAsyncThunk(
  'session/endSession',
  async ({ completed = true, stats = {} }, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const { currentSession, answers } = state.session;
      
      if (!currentSession) {
        return thunkAPI.rejectWithValue('No hay una sesión activa para finalizar');
      }
      
      // Preparar estadísticas generales
      const estadisticasGenerales = {
        preguntasTotales: stats.questionsTotal || answers.length,
        preguntasCorrectas: stats.questionsCorrect || answers.filter(a => a.esCorrecta).length,
        segundosPromedioRespuesta: stats.averageResponseTime || (
          answers.length > 0
            ? answers.reduce((sum, a) => sum + a.tiempoUtilizado, 0) / answers.length
            : 0
        ),
        nivelDificultadPromedio: 'media', // Esto podría calcularse mejor
        precision: stats.accuracy || (
          answers.length > 0
            ? answers.filter(a => a.esCorrecta).length / answers.length
            : 0
        )
      };
      
      // Preparar datos de las preguntas respondidas
      const preguntasSesion = answers.map(answer => ({
        preguntaId: answer.preguntaId,
        esCorrecta: answer.esCorrecta,
        segundosUtilizados: answer.tiempoUtilizado,
        usaPista: answer.usoPista || false,
        usaChatbot: answer.usoChatbot || false,
        archivaPregunta: answer.archivaPregunta || false,
        reportaPregunta: answer.reportaPregunta || false
      }));
      
      // Finalizar sesión
      const response = await SesionService.finalizarSesion(currentSession._id, {
        completada: completed,
        estadisticasGenerales,
        preguntasSesion
      });
      
      return response.data.sesion;
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
const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    saveAnswer: (state, action) => {
      // Guardar respuesta a una pregunta
      state.answers.push(action.payload);
    },
    clearAnswers: (state) => {
      // Limpiar respuestas (al iniciar nueva sesión)
      state.answers = [];
    },
    updateSessionStats: (state, action) => {
      // Actualizar estadísticas de la sesión
      const { isCorrect, timeSpent } = action.payload;
      
      // Incrementar contadores
      state.stats.questionsTotal += 1;
      if (isCorrect) {
        state.stats.questionsCorrect += 1;
      }
      
      // Actualizar tiempo promedio
      const totalTime = state.stats.averageResponseTime * (state.stats.questionsTotal - 1) + timeSpent;
      state.stats.averageResponseTime = totalTime / state.stats.questionsTotal;
      
      // Actualizar precisión
      state.stats.accuracy = state.stats.questionsCorrect / state.stats.questionsTotal;
    },
    bookmarkQuestion: (state, action) => {
      // Marcar pregunta como guardada
      const preguntaId = action.payload;
      const answer = state.answers.find(a => a.preguntaId === preguntaId);
      if (answer) {
        answer.archivaPregunta = true;
      }
    },
    reportQuestion: (state, action) => {
      // Reportar una pregunta
      const preguntaId = action.payload;
      const answer = state.answers.find(a => a.preguntaId === preguntaId);
      if (answer) {
        answer.reportaPregunta = true;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Crear sesión
      .addCase(startSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        state.answers = [];
        state.stats = {
          questionsTotal: 0,
          questionsCorrect: 0,
          averageResponseTime: 0,
          accuracy: 0
        };
      })
      .addCase(startSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Finalizar sesión
      .addCase(endSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(endSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = null;
      })
      .addCase(endSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  saveAnswer,
  clearAnswers,
  updateSessionStats,
  bookmarkQuestion,
  reportQuestion
} = sessionSlice.actions;

export default sessionSlice.reducer;