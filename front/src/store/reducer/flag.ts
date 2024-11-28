import {History, Leaderboards} from "../model/flag";

interface FlagState {
    flags: any;
    randomFlags: string[]
    loading: boolean;
    error: any;
    step: number;
    maxStep: number;
    correctGuess: {[key: number]: { correctGuess: boolean, hints: string[] }};
    answers: string[];
    isWin: boolean;
    isLoose: boolean;
    profile: { id: string, streak: number, points: number, history: History[], name: string, isGoogleAccount: boolean } | null;
    tries: number;
    leaderboards: Leaderboards;
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
        0: {correctGuess: false, hints: []},
        1: {correctGuess: false, hints: []},
        2: {correctGuess: false, hints: []}
    },
    isWin: false,
    isLoose: false,
    profile: null,
    tries: 0,
    leaderboards: {points: [], streak: []},
};

const flagReducer = (state = initialState, action: any): FlagState => {
    switch (action.type) {
        case 'FETCH_FLAGS_REQUEST':
        case 'GUESS_REQUEST':
        case 'START_GUESS_REQUEST':
        case 'PROFILE_REQUEST':
        case 'UPDATE_NAME_REQUEST':
        case 'LEADERBOARD_REQUEST':
            return { ...state, loading: true, error: null };
        case "RESET_ERROR":
            return { ...state, error: null };
        case 'FETCH_FLAGS_SUCCESS':
            return { ...state, loading: false, flags: action.payload };
        case 'GUESS_SUCCESS': {
            return { ...state,
                loading: false,
                correctGuess: { ...state.correctGuess, [state.step]: {correctGuess: action.correctGuess, hints: action.hint}},
                tries: action.tries,
                answers: action.answers,
                isWin: action.isFinished === 'WIN',
                isLoose: action.isFinished === 'LOOSE',
            }
        }
        case 'START_GUESS_SUCCESS':
            return { ...state,
                loading: false,
                randomFlags: action.payload.images,
                isWin: action.payload.isFinished === 'WIN',
                isLoose: action.payload.isFinished === 'LOOSE',
                correctGuess: {
                    ...state.correctGuess,
                    [state.step]: {correctGuess: false, hints: action.payload.hint ?? []}
                },
                answers: action.payload.answers
            }
        case 'PROFILE_REQUEST_SUCCESS':
            return { ...state, loading: false, profile: action.profile };
        case 'UPDATE_NAME_SUCCESS':
            // @ts-ignore
            return { ...state, loading: false, profile: { ...state.profile, name: action.name } };
        case 'LEADERBOARD_SUCCESS':
            return { ...state, loading: false, leaderboards: action.leaderboards };
        case 'FETCH_FLAGS_FAILURE':
        case 'GUESS_FAILURE':
        case 'START_GUESS_FAILURE':
        case 'PROFILE_REQUEST_FAILURE':
        case 'UPDATE_NAME_FAILURE':
        case 'LEADERBOARD_FAILURE':
            return { ...state, loading: false, error: action.payload };
        case 'UPDATE_STEP':
            return { ...state, step: action.step };
        default:
            return state;
    }
};

export default flagReducer;
