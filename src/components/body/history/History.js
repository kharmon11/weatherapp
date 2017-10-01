import React from 'react';

import HistoryFormContainer from './HistoryForm/HistoryFormContainer';
import HistoryGraphsContainer from './historyGraphs/HistoryGraphsContainer';

import './History.css';

function History(props) {
    return (
        <div id="history">
            <div id="history_location">{props.location}</div>
            <HistoryFormContainer/>
            <HistoryGraphsContainer/>
        </div>
    )
}
export default History;