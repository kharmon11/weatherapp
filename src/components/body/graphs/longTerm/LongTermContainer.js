import React from 'react';
import {connect} from 'react-redux';
import Chart from 'chart.js';

import {TempLongConfig, PrecipLongConfig, WindLongConfig} from '../configs';

import LongTerm from './LongTerm';

function LongTermContainer(props) {
    const tempConfig = new TempLongConfig(props.data);
    tempConfig.create().then((config) => {
      const tempCtx = document.getElementById("canvas_temp");
      const tempChart = new Chart(tempCtx, config);
    });

    const precipConfig = new PrecipLongConfig(props.data);
    precipConfig.create().then((config) => {
      const precipCtx = document.getElementById("canvas_precip");
      const precipChart = new Chart(precipCtx, config);
    });

    const windConfig = new WindLongConfig(props.data);
    windConfig.create().then((config) => {
      const windCtx = document.getElementById("canvas_wind");
      const windChart = new Chart(windCtx, config);
    });

    let place = "";
    if (props.data.city) {
      place += props.data.city;
    }
    if (props.data.state) {
      place += (", " + props.data.state);
    }
    if (props.data.country) {
      place += (" " + props.data.country);
    }

    return <LongTerm place={place}/>;
}

const mapStateToProps = state => {
    return {
        data: state.data,
    }
}
  
export default connect(mapStateToProps)(LongTermContainer);