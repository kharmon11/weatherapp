import React from 'react';

import ClearNight from './icons/clearNight/ClearNight';
import Cloud from './icons/cloud/Cloud';
import Fog from './icons/fog/Fog';
import PartlyCloudy from './icons/PartlyCloudy/PartlyCloudy';
import PartlyCloudyNight from './icons/PartlyCloudyNight/PartlyCloudyNight';
import Rain from './icons/rain/Rain';
import Sleet from './icons/sleet/Sleet';
import Snow from './icons/snow/Snow';
import Sun from './icons/sun/Sun';
import Wind from './icons/wind/Wind';

import './WeatherIcon.css';

function WeatherIcon(props) {
    let icon;
    switch (props.icon) {
      case "clear-day":
        icon = <Sun/>
        break;
      case "clear-night":
        icon = <ClearNight/>;
        break;
      case "rain":
        icon = <Rain/>;
        break;
      case "snow":
        icon = <Snow/>;
        break;
      case "sleet":
        icon = <Sleet/>;
        break;
      case "wind":
        icon = <Wind/>;
        break;
      case "fog":
        icon = <Fog/>;
        break;
      case "cloudy":
        icon = <Cloud/>;
        break;
      case "partly-cloudy-day":
        icon = <PartlyCloudy/>;
        break;
      case "partly-cloudy-night":
        icon = <PartlyCloudyNight/>;
        break;
      default:
        icon = (
          <svg height="100" width="100"></svg>
        );
  }
  return (
    <svg id={"wx_icon_" + props.id} className="wx-icon" role="img" viewBox="0 0 100 100" aria-label="[title]">
      {icon}
    </svg>
  );
}

export default WeatherIcon;
