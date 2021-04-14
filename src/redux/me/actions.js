import { createAction } from 'redux-actions';
import { SAVED_COUNT, MY_POST_COUNT, SET_USER } from './types';

const setSavedCountAction = createAction(SAVED_COUNT);
export const setSavedCount = (count) => (dispatch) => {
  dispatch(setSavedCountAction(count));
};

const setMyPostCountAction = createAction(MY_POST_COUNT);
export const setMyPostCount = (count) => (dispatch) => {
  dispatch(setMyPostCountAction(count));
};

const setUser = createAction(SET_USER);
export const setMyUserAction = (user) => (dispatch) => {
  dispatch(setUser(user));
};
