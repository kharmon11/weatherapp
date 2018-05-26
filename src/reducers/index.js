import {combineReducers} from 'redux'
import {sidebarReducer} from './sidebarReducer';
import {addDataReducer} from './addDataReducer';
import {showBodyReducer} from './showBodyReducer';
import {overallGraphsReducer} from './overallGraphsReducer';
import {historyDataReducer} from './historyDataReducer';

const reducer = combineReducers(
    {
        sidebar: sidebarReducer, 
        data: addDataReducer, 
        showBody: showBodyReducer,
        overall: overallGraphsReducer,
        history: historyDataReducer,
    }
);

export default reducer
