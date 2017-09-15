import React from 'react';

import HistoryFormContainer from './HistoryForm/HistoryFormContainer';

import './History.css';

function History(props) {
    return (
        <div id="history">
            <div id="history_location">{props.location}</div>
            <HistoryFormContainer/>
        </div>
    )
}
export default History;