import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';
import jwt_decode from 'jwt-decode';

import { GET_ERRORS, SET_CURRENT_USER } from './types';

//Register User Action
export const registerUser = (userData, history) => dispatch => {
    axios.post('/api/users/register', userData)
        .then(res => history.push('/login'))
        .catch(err =>
            dispatch({ //dispatch thunk middleware
                type: GET_ERRORS,
                payload: err.response.data
            })
        );
};

//Login  - Get User token
export const loginUser = (userData) => dispatch => {
    axios.post('/api/users/login', userData)
        .then(res => {
            //Save to Local storage(token)
            const { token } = res.data;

            //Set token to is
            localStorage.setItem('jwtToken', token);

            //Set token to Auth Header
            setAuthToken(token);

            //Decode token to get user data.
            const decoded = jwt_decode(token);

            //Set Current User
            dispatch(setCurrentUser(decoded));
        }).catch(err => {
            dispatch({ //dispatch thunk middleware
                type: GET_ERRORS,
                payload: err.response.data
            })
        });
};


//Set LoggedIn User
export const setCurrentUser = (decoded) => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded
    }
};

//Log user out..
export const logoutUser = () => dispatch => {
    //Remove the token from local storage..
    localStorage.removeItem('jwtToken');

    //Remove auth header from axios
    setAuthToken(false);

    //Set the current user to {} which will also  set isAuthenticated to false
    dispatch(setCurrentUser({}));
};