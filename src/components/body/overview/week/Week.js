import React from 'react';

import Alert from './alert/Alert';
import Day from './day/Day';

import './Week.css';

function Week(props) {
    let alerts;
    if (props.alert) {
      alerts = props.alert.map((alert, i) => {
        return (<Alert alert={alert} id={i}/>);
      });
    } else {
      alerts = <span></span>
    }
    let days;
    days = props.data.data.map((data, i) => {
      return (<Day id={i} data={data}/>)
    })
    return (
      <div id="week">
        <div id="week_alert">
          {alerts}
        </div>
        <div id="days">
          {days}
        </div>
      </div>
    );
}
export default Week;