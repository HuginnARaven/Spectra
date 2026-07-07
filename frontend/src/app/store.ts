import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import urlsReducer from '../features/urls/urlsSlice';
import analyticsReducer from '../features/analytics/analyticsSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import accountReducer from '../features/account/accountSlice';


export const store = configureStore({
    reducer: {
        auth: authReducer,
        account: accountReducer,
        urls: urlsReducer,
        analytics: analyticsReducer,
        dashboard: dashboardReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
