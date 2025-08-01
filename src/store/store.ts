import { configureStore } from '@reduxjs/toolkit';
import medicalReducer from './slices/medicalSlice';

export const store = configureStore({
  reducer: {
    medical: medicalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;