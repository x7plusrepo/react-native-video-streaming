import { createAction } from 'redux-actions';
import { SET_ROOMS } from './types';

const setLiveStreamRoomsAction = createAction(SET_ROOMS);
export const setLiveStreamRooms = (rooms) => (dispatch) => {
    dispatch(setLiveStreamRoomsAction(rooms));
};
