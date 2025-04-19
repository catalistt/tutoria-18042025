import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import NotificationService from '../../services/NotificationService';

// Estado inicial
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null
};

// Acción asíncrona para obtener notificaciones
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (userId, thunkAPI) => {
    try {
      const response = await NotificationService.getUserNotifications(userId);
      return response.data.notifications;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Error al obtener notificaciones'
      );
    }
  }
);

// Acción asíncrona para marcar notificación como leída
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, thunkAPI) => {
    try {
      const response = await NotificationService.markAsRead(notificationId);
      return response.data.notification;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Error al marcar notificación como leída'
      );
    }
  }
);

// Slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Obtener notificaciones
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.leida).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Marcar como leída
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
          state.unreadCount = state.notifications.filter(n => !n.leida).length;
        }
      });
  },
});

export default notificationsSlice.reducer;