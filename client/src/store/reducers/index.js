import { combineReducers } from 'redux';
import errorReducer from './errorReducer';
import authReducer from './authReducer';
import postsReducer from './postsReducer';

export default combineReducers({
  errors: errorReducer,
  auth: authReducer,
  posts: postsReducer,
});