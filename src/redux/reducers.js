import {combineReducers} from 'redux';
import home from './home/reducer';
import message from './message/reducer';
import me from './me/reducer';

const appReducer = combineReducers({
  home,
  message,
  me,
});

const rootReducer = (state, action) => {
  return appReducer(state, action);
};

export default rootReducer;
