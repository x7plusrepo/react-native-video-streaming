import {combineReducers} from 'redux';
import Home from './home/reducer';
import Message from './message/reducer';
import Me from './me/reducer';

const appReducer = combineReducers({
  Home,
  Message,
  Me,
});

const rootReducer = (state, action) => {
  return appReducer(state, action);
};

export default rootReducer;
