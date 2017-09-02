import React from 'react';
import moment from 'moment-timezone';

import CurrentContainer from './current/CurrentContainer';
import MapContainer from './map/MapContainer'
import WeekContainer from './week/WeekContainer';

import './Overview.css';

function Overview(props) {
    return (
        <div id="overview">
            <div id="overview_current_data" className="overview-div">
                <CurrentContainer/>
            </div>
            <div id="overview_map" className="overview-div">
                <div id="time_place_div" className="overview-div">
                    <div id="time-div" className="time-place">{moment.tz(props.data.currently.time * 1000, props.data.timezone).format("ddd M/DD h:mma")}</div>
                    <div id="place_div" className="time-place">{props.data.city}, {props.data.state}, {props.data.country}</div>
                </div>
                <div id="map_wrapper">
                    <MapContainer/>
                </div>
            </div>
            <div id="overview_week" className="overview-div">
                <WeekContainer/>
            </div>
        </div>
    );
}

export default Overview;
