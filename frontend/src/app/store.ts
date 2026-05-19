import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import urlsReducer from '../features/urls/urlsSlice';
import analyticsReducer from '../features/analytics/analyticsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        urls: urlsReducer,
        analytics: analyticsReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
