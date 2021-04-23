import { handleActions } from 'redux-actions';
import { SET_ROOMS } from './types';

const INITIAL_STATE = {
    rooms: [],
};

const actionMap = {};

actionMap[SET_ROOMS] = (state, { payload }) => ({
    rooms: payload || [],
});

export default handleActions(actionMap, INITIAL_STATE);
