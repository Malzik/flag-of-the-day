// src/actions/counter.ts
import {Dispatch} from "redux";
import {Flag, Player} from "../model/flag";
import {getFormattedDate} from "../../utils/normalize";

const apiUrl = process.env.REACT_APP_API_URL
// Define action types
export const PROFILE_REQUEST = 'PROFILE_REQUEST';
export const PROFILE_REQUEST_SUCCESS = 'PROFILE_REQUEST_SUCCESS';
export const PROFILE_REQUEST_FAILURE = 'PROFILE_REQUEST_FAILURE';
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
export const RESET_ERROR = 'RESET_ERROR';

// Define action creators
const profileRequest = () => ({
    type: PROFILE_REQUEST,
});

const profileRequestSuccess = (data: Player[]) => ({
    type: PROFILE_REQUEST_SUCCESS,
    payload: data,
});

const profileRequestFailure = (error: string) => ({
    type: PROFILE_REQUEST_FAILURE,
    payload: error,
});
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

const resetErrorRequest = () => ({
    type: RESET_ERROR,
});

const guessSuccess = (data: {correctGuess: boolean, hint: string, tries: number, isFinished: string, answers: string[]}, name: string) => ({
    type: GUESS_SUCCESS,
    correctGuess: data.correctGuess,
    hint: data.hint,
    answer: name,
    tries: data.tries,
    isFinished: data.isFinished,
    answers: data.answers
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

const startGuessFailure = (error: any) => ({
    type: START_GUESS_FAILURE,
    payload: error,
});

export const updateStep = (newStep: number) => ({
    type: UPDATE_STEP,
    step: newStep,
});

export const getProfile = (id: string) => {
    return async (dispatch: Dispatch) => {
        dispatch(profileRequest());

        try {
            let url = apiUrl + '/profile'
            if (id !== null) {
                url += '?id=' + id
            }
            const response = await fetch(url);
            const data = await response.json();

            dispatch(profileRequestSuccess(data));
        } catch (error: any) {
            dispatch(profileRequestFailure(error));
        }
    };
};

export const resetError = () => {
    return async (dispatch: Dispatch) => {
        dispatch(resetErrorRequest());
    };
};

// Async action creator using redux-thunk
export const fetchFlags = () => {
    return async (dispatch: Dispatch) => {
        dispatch(fetchFlagsRequest());

        try {
            const response = await fetch('flags.json');
            const data = await response.json();
            dispatch(fetchFlagsSuccess(data));
        } catch (error: any) {
            dispatch(fetchFlagsFailure(error));
        }
    };
};

export const getFlagOfTheDay = (id: string, lang: string) => {
    return async (dispatch: Dispatch) => {
        dispatch(startGuessRequest());

        try {
            const response = await fetch(apiUrl + '/startGuess?date=' + getFormattedDate() + '&id=' + id + '&lang=' + lang);
            if (response.status >= 300) {
                dispatch(startGuessFailure(response));
            }
            const data = await response.json();
            dispatch(startGuessSuccess(data));
        } catch (error: any) {
            dispatch(startGuessFailure(error));
        }
    };
};

export const guess = (name: string, lang: string, id: string) => {
    return async (dispatch: Dispatch) => {
        dispatch(guessRequest());

        try {
            const response = await fetch(apiUrl + '/guess', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name, lang, id, date: getFormattedDate()})
            });
            const data = await response.json();
            dispatch(guessSuccess(data, name));
        } catch (error: any) {
            dispatch(guessFailure(error));
        }
    };
};
