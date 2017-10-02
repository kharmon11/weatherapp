import React from 'react';
import moment from 'moment-timezone';

import HistoryFormContainer from './HistoryForm/HistoryFormContainer';
import HistoryGraphsContainer from './historyGraphs/HistoryGraphsContainer';

import './History.css';

function History(props) {
    let date = "";
    if (props.history) {
        date = moment.tz(props.history.hourly.data[23].time * 1000, props.timezone).format("MM/DD/YYYY");
    }
    return (
        <div id="history">
            <div id="history_meta">
                <span id="history_location" className="history-meta-data">{props.location}</span>
                <span id="history_time" className="hsitory-meta-data">{date}</span>
            </div>
            <HistoryFormContainer/>
            <HistoryGraphsContainer/>
        </div>
    )
}
export default History;