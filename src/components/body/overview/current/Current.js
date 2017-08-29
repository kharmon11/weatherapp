import React from 'react';

import './Current.css';

import WeatherIcon from '../weatherIcon/WeatherIcon';
import CurrentTemp from './currentTemp/CurrentTemp';
import WindVane from './windVane/WindVane';
import Other from './other/Other';

function Current(props) {
    return (
            <div id="current_wx_main" className="text-center">
                <div className="current-wx-half">
                    <WindVane windBearing={props.currently.windBearing}/>
                    <div id="current_wx_icon" className="current-wx">
                        <WeatherIcon id="current" icon={props.currently.icon}/>
                        <div id="icon_summary">
                            {props.currently.summary}
                        </div>
                    </div>
                    <CurrentTemp temp={Math.round(props.currently.temperature)} maxTemp={Math.round(props.today.temperatureMax)} minTemp={Math.round(props.today.temperatureMin)} dewPt={Math.round(props.currently.dewPoint)}/>
                </div>
                <div className="current-wx-half">
                    <Other currently={props.currently}/>
                </div>
            </div>
    );
}

export default Current;