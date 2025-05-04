import { configureStore } from '@reduxjs/toolkit';
import socketReducer from './socketSlice';
import userSlice from './userSlice'

export const store = configureStore({
  reducer: {
    socket: socketReducer,
    user: userSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
