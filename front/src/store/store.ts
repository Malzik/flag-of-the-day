// src/store.ts
import {createStore, combineReducers, applyMiddleware} from 'redux';
import flagReducer from "./reducer/flag";
import {thunk} from "redux-thunk";
import {i18nSlice} from "../i18n/i18nSlice";

const rootReducer = combineReducers({
    flag: flagReducer,
    i18n: i18nSlice.reducer,
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export type RootState = ReturnType<typeof rootReducer>;

export default store;
