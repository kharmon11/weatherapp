import React, {Component} from 'react';
import {connect} from 'react-redux';
import Chart from 'chart.js';

import {TempTodayConfig, PrecipTodayConfig, WindTodayConfig} from '../../configs';

import HistoryGraphs from './HistoryGraphs';

function HistoryGraphsContainer(props) {
    if (props.history) {
        const tempConfig = new TempTodayConfig(props.history);
        tempConfig.create().then((config) => {
            const tempCtx = document.getElementById("canvas_temp");
            const tempChart = new Chart(tempCtx, config);
        });
        const precipConfig = new PrecipTodayConfig(props.history);
        precipConfig.create().then((config) => {
            const precipCtx = document.getElementById("canvas_precip");
            const precipChart = new Chart(precipCtx, config);
        });
        const windConfig = new WindTodayConfig(props.history);
        windConfig.create().then((config) => {
            const windCtx = document.getElementById("canvas_wind");
            const windChart = new Chart(windCtx, config);
        });
    }
    let historyStatus = false;
    if (props.history) {
        historyStatus = true;
    }
    return <HistoryGraphs history={historyStatus}/>;
}

const mapStateToProps = state => {
    return {
        history: state.history,
    }
}

export default connect(mapStateToProps)(HistoryGraphsContainer);