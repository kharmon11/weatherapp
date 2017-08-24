import {combineReducers} from 'redux'
import {sidebarReducer} from './sidebarReducer';
import {addDataReducer} from './addDataReducer';
import {showBodyReducer} from './showBodyReducer';
import {overallGraphsReducer} from './overallGraphsReducer';

const reducer = combineReducers(
    {
        sidebar: sidebarReducer, 
        data: addDataReducer, 
        showBody: showBodyReducer,
        overall: overallGraphsReducer,
    }
);

export default reducer
