import React from 'react';
import moment from 'moment-timezone';

import WeatherIcon from '../../weatherIcon/WeatherIcon';

import './Day.css';

function Day(props) {
    let icon;
    switch (props.data.icon) {
        case "clear-night":
            icon = "clear-day";
            break;
        case "partly-cloudy-night":
            icon = "partly-cloudy-day";
            break;
        default:
            icon = props.data.icon;
            break;
    }
    return (
        <div className="day-data-wrapper">
            <div className="day-data">
                <div className="day-sub-div day-date">
                    {moment.tz(props.data.time * 1000, props.timezone).format("ddd M/DD")}
                </div>
                <div className="day-sub-div day-icon"><WeatherIcon id={props.id} icon={icon}/></div>
                <div className="day-sub-div day-other">
                    <div className="day-temp">
                        <span className="day-other-data"
                              title="High Temperature">{Math.round(props.data.temperatureMax)}</span>
                        <span>/</span>
                        <span className="day-other-data"
                              title="Low Temperature">{Math.round(props.data.temperatureMin)}</span>
                    </div>
                    <div className="day-precip">
                        <span className="day-other-data"
                              title="Probability of Precipitation">{Math.round(props.data.precipProbability * 100)}%</span>
                    </div>
                </div>
            </div>
            <div className="day-summary">{props.data.summary}</div>
        </div>
    );
}

export default Day;