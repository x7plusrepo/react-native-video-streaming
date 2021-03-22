import {handleActions} from 'redux-actions';
import {SAVED_COUNT, MY_POST_COUNT} from './types';

const INITIAL_STATE = {
  savedCount: 0,
  myPostCount: 0,
};

const actionMap = {};

actionMap[SAVED_COUNT] = (state, {payload}) => ({
  ...state,
  savedCount: payload,
});

actionMap[MY_POST_COUNT] = (state, {payload}) => ({
  ...state,
  myPostCount: payload,
});

export default handleActions(actionMap, INITIAL_STATE);
