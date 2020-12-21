import {createStore, applyMiddleware} from 'redux';
import {composeWithDevTools} from 'redux-logger';
import thunk from 'redux-thunk';
import dataReducer from './dataReducer';
import logger from 'redux-logger';


const store = createStore(dataReducer, composeWithDevTools(logger));
export default store;