import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getSocket } from '../utils/socket';
import { AppDispatch } from './store';
import { Notification } from '@/utils/api';
import { addTask, updateTask } from './taskSlice';

interface SocketState {
  connected: boolean;
  notifications: Notification[];
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
    addNotification: (state, action: PayloadAction<Notification[]>) => {
      state.notifications.unshift(...action.payload);
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

    socket.on('taskAssigned', (message: Notification) => {
      console.log("taskAssigend", message)
      if (message.task) {
        console.log("there is task ", message.task)
        dispatch(addTask([message.task]))
      }
      dispatch(addNotification([message]));
    });

    socket.on('taskUpdated', (message: Notification) => {
      if (message.task) {
        dispatch(updateTask(message.task))
      }
      dispatch(addNotification([message]));
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
