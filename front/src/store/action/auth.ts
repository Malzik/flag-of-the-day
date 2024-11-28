import {Dispatch} from "redux";

const apiUrl = process.env.REACT_APP_API_URL
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';

export const loginSuccess = (data: {playerId: string}) => ({
  type: LOGIN_SUCCESS,
  playerId: data.playerId,
});

export const loginFailure = (error: any) => ({
  type: LOGIN_FAILURE,
  error: error,
});

export const logout = () => ({
  type: LOGOUT,
});

export const loginRequest = () => ({
  type: LOGIN_REQUEST,
});

export const identifyUser = (user: any, id: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(loginRequest());

      try {
        const response = await fetch(apiUrl + '/auth/google', {
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({user, id})
        });
        const data = await response.json();

        dispatch(loginSuccess(data));
    } catch (error: any) {
        dispatch(loginFailure(error));
    }
};
}
