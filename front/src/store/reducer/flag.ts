interface FlagState {
    flags: any;
    randomFlags: string[]
    loading: boolean;
    error: string | null;
    step: number;
    maxStep: number;
    correctGuess: {[key: number]: { correctGuess: boolean, hints: string[] }};
    answers: string[];
    isWin: boolean;
    isLoose: boolean;
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
    isLoose: false
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
            let isWin = false
            if (state.step === state.maxStep - 1 && action.correctGuess) {
                isWin = true
            }
            return { ...state, loading: false, correctGuess: { ...state.correctGuess, [state.step]: {correctGuess: action.correctGuess, hints: [...state.correctGuess[state.step].hints, action.hint]}}, answers, isWin };
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
