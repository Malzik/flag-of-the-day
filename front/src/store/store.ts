// src/store.ts
import {createStore, combineReducers, applyMiddleware} from 'redux';
import flagReducer from "./reducer/flag";
import thunk from "redux-thunk";

const rootReducer = combineReducers({
    flag: flagReducer,
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export type RootState = ReturnType<typeof rootReducer>;

export default store;
