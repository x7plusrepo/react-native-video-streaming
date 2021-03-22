import {createAction} from 'redux-actions';
import {store} from '../store';
import {SAVED_COUNT, MY_POST_COUNT} from './types';

const setSavedCountAction = createAction(SAVED_COUNT);
export const setSavedCount = (count) => (dispatch) => {
  dispatch(setSavedCountAction(count));
};

const setMyPostCountAction = createAction(MY_POST_COUNT);
export const setMyPostCount = (count) => (dispatch) => {
  dispatch(setMyPostCountAction(count));
};
