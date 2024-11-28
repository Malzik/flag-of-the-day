import { combineReducers, configureStore } from '@reduxjs/toolkit';

import flagReducer from "./reducer/flag";
import authReducer from "./reducer/auth"; // Add this import
import {thunk} from "redux-thunk";
import {i18nSlice} from "../i18n/i18nSlice";

const rootReducer = combineReducers({
    flag: flagReducer,
    i18n: i18nSlice.reducer,
    auth: authReducer, // Add this line
});

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
