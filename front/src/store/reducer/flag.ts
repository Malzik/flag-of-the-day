// src/reducers/counter.ts
import {Flag} from "../model/flag";

interface FlagState {
    flags: any;
    randomFlags: string[]
    loading: boolean;
    error: string | null;
    step: number;
    maxStep: number;
    correctGuess: {[key: number]: boolean};
    answers: string[]
}

const initialState: FlagState = {
    flags: [],
    randomFlags: [],
    loading: false,
    error: null,
    step: 0,
    maxStep: 3,
    answers: [],
    correctGuess: {
        0: false,
        1: false,
        2: false
    }
};

const flagReducer = (state = initialState, action: any): FlagState => {
    switch (action.type) {
        case 'FETCH_FLAGS_REQUEST':
        case 'GUESS_REQUEST':
        case 'START_GUESS_REQUEST':
            return { ...state, loading: true, error: null };
        case 'FETCH_FLAGS_SUCCESS':
            return { ...state, loading: false, flags: action.payload };
        case 'GUESS_SUCCESS': {
            const answers = [...state.answers]
            if (action.correctGuess) {
                answers.push(action.answer)
            }
            return { ...state, loading: false, correctGuess: { ...state.correctGuess, [state.step]: action.correctGuess}, answers };
        }
        case 'START_GUESS_SUCCESS':
            return { ...state, loading: false, randomFlags: action.payload.images };
        case 'FETCH_FLAGS_FAILURE':
        case 'GUESS_FAILURE':
        case 'START_GUESS_FAILURE':
            return { ...state, loading: false, error: action.payload };
        case 'UPDATE_STEP':
            return { ...state, step: action.step };
        default:
            return state;
    }
};

export default flagReducer;
