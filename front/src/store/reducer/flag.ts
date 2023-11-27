// src/reducers/counter.ts
import {Flag} from "../model/flag";

interface FlagState {
    flags: any;
    randomFlags: string[]
    loading: boolean;
    error: string | null;
    maxStep: number;
    correctGuess: boolean;
}

const initialState: FlagState = {
    flags: [],
    randomFlags: [],
    loading: false,
    error: null,
    maxStep: 3,
    correctGuess: false
};

const flagReducer = (state = initialState, action: any): FlagState => {
    switch (action.type) {
        case 'FETCH_FLAGS_REQUEST':
        case 'GUESS_REQUEST':
        case 'START_GUESS_REQUEST':
            return { ...state, loading: true, error: null };
        case 'FETCH_FLAGS_SUCCESS':
            return { ...state, loading: false, flags: action.payload };
        case 'GUESS_SUCCESS':
            return { ...state, loading: false, correctGuess: action.payload };
        case 'START_GUESS_SUCCESS':
            return { ...state, loading: false, randomFlags: action.payload.images };
        case 'FETCH_FLAGS_FAILURE':
        case 'GUESS_FAILURE':
        case 'START_GUESS_FAILURE':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export default flagReducer;
