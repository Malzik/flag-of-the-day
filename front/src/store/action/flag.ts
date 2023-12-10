// src/actions/counter.ts
import {Dispatch} from "redux";
import {Flag} from "../model/flag";

const apiUrl = process.env.REACT_APP_API_URL
// Define action types
export const FETCH_FLAGS_REQUEST = 'FETCH_FLAGS_REQUEST';
export const FETCH_FLAGS_SUCCESS = 'FETCH_FLAGS_SUCCESS';
export const FETCH_FLAGS_FAILURE = 'FETCH_FLAGS_FAILURE';
export const GUESS_REQUEST = 'GUESS_REQUEST';
export const GUESS_SUCCESS = 'GUESS_SUCCESS';
export const GUESS_FAILURE = 'GUESS_FAILURE';
export const START_GUESS_REQUEST = 'START_GUESS_REQUEST';
export const START_GUESS_SUCCESS = 'START_GUESS_SUCCESS';
export const START_GUESS_FAILURE = 'START_GUESS_FAILURE';
export const UPDATE_STEP = 'UPDATE_STEP';

// Define action creators
const fetchFlagsRequest = () => ({
    type: FETCH_FLAGS_REQUEST,
});

const fetchFlagsSuccess = (data: Flag[]) => ({
    type: FETCH_FLAGS_SUCCESS,
    payload: data,
});

const fetchFlagsFailure = (error: string) => ({
    type: FETCH_FLAGS_FAILURE,
    payload: error,
});

const guessRequest = () => ({
    type: GUESS_REQUEST,
});
const guessSuccess = (data: {correctGuess: boolean}, name: string) => ({
    type: GUESS_SUCCESS,
    correctGuess: data.correctGuess,
    answer: name
});

const guessFailure = (error: string) => ({
    type: GUESS_FAILURE,
    payload: error,
});

const startGuessRequest = () => ({
    type: START_GUESS_REQUEST,
});
const startGuessSuccess = (data: Flag[]) => ({
    type: START_GUESS_SUCCESS,
    payload: data,
});

const startGuessFailure = (error: string) => ({
    type: START_GUESS_FAILURE,
    payload: error,
});

export const updateStep = (newStep: number) => ({
    type: UPDATE_STEP,
    step: newStep,
});

// Async action creator using redux-thunk
export const fetchFlags = () => {
    return async (dispatch: Dispatch) => {
        dispatch(fetchFlagsRequest());

        try {
            const response = await fetch('flags.json');
            const data = await response.json();
            dispatch(fetchFlagsSuccess(data));
        } catch (error: any) {
            dispatch(fetchFlagsFailure(error.message));
        }
    };
};

export const getFlagOfTheDay = () => {
    return async (dispatch: Dispatch) => {
        dispatch(startGuessRequest());

        try {
            const response = await fetch(apiUrl + '/startGuess');
            const data = await response.json();
            dispatch(startGuessSuccess(data));
        } catch (error: any) {
            dispatch(startGuessFailure(error.message));
        }
    };
};

export const guess = (step: number, name: string) => {
    return async (dispatch: Dispatch) => {
        dispatch(guessRequest());

        try {
            const response = await fetch(apiUrl + '/guess', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({step, name})
            });
            const data = await response.json();
            dispatch(guessSuccess(data, name));
        } catch (error: any) {
            dispatch(guessFailure(error.message));
        }
    };
};
