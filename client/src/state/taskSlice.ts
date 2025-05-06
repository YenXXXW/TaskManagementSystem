import { Task } from '@/utils/api';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  tasks: Task[];
}

const initialState: UserState = {
  tasks: []
};

const taskSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {

    refechTask: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    addTask: (state, action: PayloadAction<Task[]>) => {
      state.tasks.unshift(...action.payload);
    },

    updateTask: (state, action: PayloadAction<Task>) => {
      console.log("update here")
      const index = state.tasks.findIndex(task => task._id === action.payload._id);
      const newState = state.tasks
      if (index !== -1) {
        newState[index]
        state.tasks[index] = action.payload;
      }
    },

    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task._id !== action.payload);
    }
  }
});

export const { refechTask, addTask, updateTask, deleteTask } = taskSlice.actions;
export default taskSlice.reducer;
