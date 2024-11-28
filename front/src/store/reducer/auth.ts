import { LOGIN_SUCCESS, LOGIN_FAILURE, LOGIN_REQUEST, LOGOUT } from '../action/auth';

interface AuthState {
  isAuthenticated: boolean;
  playerId: string | null;
  loading: boolean;
  error: any;
}

const initialState: AuthState = {
  isAuthenticated: false,
  playerId: null,
  loading: false,
  error: null,
};

const authReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        playerId: action.playerId,
        loading: false,
        error: null,
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    case LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        playerId: null,
      };
    default:
      return state;
  }
};

export default authReducer;