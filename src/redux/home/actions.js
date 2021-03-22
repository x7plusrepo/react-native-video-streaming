import {createAction} from 'redux-actions';
import {store} from '../store';
import {KEYWORD} from './types';

const setKeywordAction = createAction(KEYWORD);
export const setKeyword = (keyword) => (dispatch) => {
  dispatch(setKeywordAction(keyword));
};
