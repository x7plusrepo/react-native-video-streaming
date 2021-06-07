import {handleActions} from 'redux-actions';
import {MY_POST_COUNT, SAVED_COUNT, SET_USER} from './types';

const INITIAL_STATE = {
  savedCount: 0,
  myPostCount: 0,
  user: {},
};

const actionMap = {};

actionMap[SAVED_COUNT] = (state, { payload }) => ({
  ...state,
  savedCount: payload,
});

actionMap[MY_POST_COUNT] = (state, { payload }) => ({
  ...state,
  myPostCount: payload,
});

actionMap[SET_USER] = (state, { payload }) => ({
  ...state,
  user: payload,
});
export default handleActions(actionMap, INITIAL_STATE);
