import React from 'react';

import OtherRow from './otherRow/OtherRow';

import './Other.css';

function Other(props) {
    
    return (
        <div id="other_current_data" className="current-wx">
          <OtherRow col1={"Dewpoint: " + Math.round(props.currently.dewPoint) + String.fromCharCode(176) + "F"} col2={"Humidity: " + Math.round(props.currently.humidity) + "%"}/>
          <OtherRow col1={"Precip: " + props.currently.precipProbability * 100 + "%"} col2={"Rate: " + props.currently.precipIntensity + "in/hr"}/>
          <OtherRow col1={"Speed: " + Math.round(props.currently.windSpeed) + "mph"} col2={"Gust: " + Math.round(props.currently.windGust) + "mph"}/>
          <OtherRow col1={"SLP: " + Math.round(props.currently.pressure) + "mb"} col2={"Visibility: " + props.currently.visibility + "mi"}/>
        </div>
      );
}
export default Other;