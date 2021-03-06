import React from 'react';

import './currentTemp.css';

function currentTemp(props) {
    const deg = String.fromCharCode(176);
    return (
        <div id="current_temp_div" className="current-wx">
            <div id="current_temp" className="temp-div" alt="Temperature">{props.temp}{deg}F</div>
            <div id="min_max_temps" className="temp-div">
                <span id="max_temp" className="min-max" alt="Today's High"><span className="current-min-max-text">H</span>: {props.maxTemp}{deg}</span>
                <span id="min_temp" className="min-max" alt="Today's Low"><span className="current-min-max-text">L</span>: {props.minTemp}{deg}</span>
            </div>
        </div>
    );
}
export default currentTemp;