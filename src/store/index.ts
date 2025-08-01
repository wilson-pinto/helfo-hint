import { configureStore } from '@reduxjs/toolkit';
import medicalSlice from './slices/medicalSlice';

export const store = configureStore({
  reducer: {
    medical: medicalSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;