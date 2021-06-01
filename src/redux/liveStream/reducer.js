import { handleActions } from 'redux-actions';
import { SET_ROOMS, SET_GIFTS } from './types';

const INITIAL_STATE = {
  rooms: [],
  gifts: [],
};

const actionMap = {};

actionMap[SET_ROOMS] = (state, { payload }) => ({
  ...state,
  rooms: payload || [],
});

actionMap[SET_GIFTS] = (state, { payload }) => ({
  ...state,
  gifts: payload || [],
});

export default handleActions(actionMap, INITIAL_STATE);
