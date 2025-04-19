import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import messageReducer from './slices/messageSlice';
import learningPathReducer from './slices/learningPathSlice';
import sessionReducer from './slices/sessionSlice';
import gamificationReducer from './slices/gamificationSlice';
import notificationsReducer from './slices/notificationsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    message: messageReducer,
    learningPath: learningPathReducer,
    session: sessionReducer,
    gamification: gamificationReducer,
    notifications: notificationsReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;