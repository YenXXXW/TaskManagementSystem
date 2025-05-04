import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getSocket } from '../utils/socket';
import { AppDispatch } from './store';
import { Notification } from '@/utils/api';

interface LiveNotification {
  message: string;
  timestamp: string;
}

export type Noti = LiveNotification | Notification

interface SocketState {
  connected: boolean;
  notifications: Noti[];
}

const initialState: SocketState = {
  connected: false,
  notifications: [],
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    addNotification: (state, action: PayloadAction<Noti[]>) => {
      state.notifications.push(...action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  setConnected,
  addNotification,
  clearNotifications,
} = socketSlice.actions;

export default socketSlice.reducer;

export const connectSocket = (userId: string) => (dispatch: AppDispatch) => {
  const socket = getSocket();

  if (!socket.connected) {
    socket.connect();
    socket.emit('register', userId);
    dispatch(setConnected(true));

    socket.on('taskAssigned', (message: string) => {
      dispatch(addNotification([{
        message,
        timestamp: new Date().toISOString(),
      }]));
    });

    socket.on('taskUpdated', (message: string) => {
      dispatch(addNotification([{
        message,
        timestamp: new Date().toISOString(),
      }]));
    });
  }
};

export const disconnectSocket = () => (dispatch: AppDispatch) => {
  const socket = getSocket();
  if (socket.connected) {
    socket.disconnect();
    dispatch(setConnected(false));
  }
};
