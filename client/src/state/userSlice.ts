import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthResponse } from '@/utils/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;

}

interface UserState {
  user: User | null;
  token: string,
}

const initialState: UserState = {
  user: typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || 'null')
    : null,
  token: typeof window !== 'undefined'
    ? localStorage.getItem('token') || '' : ''

};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login(state, action: PayloadAction<AuthResponse>) {
      state.user = action.payload.data.user;
      state.token = action.payload.token
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload.data.user));
        localStorage.setItem('token', JSON.stringify(action.payload.token));
      }
    },
    logout(state) {
      state.user = null;
      state.token = ''
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
