import React from 'react';
import {connect} from 'react-redux';

import Week from './Week';

function WeekContainer(props) {
    let alerts = {};
    let alertList = [];
    if (props.data.alerts) {
        for (let i=0; i<props.data.alerts.length; i++) {
            if (alerts.hasOwnProperty(props.data.alerts[i].title)) {
                if (props.data.alerts[i].time > alerts[props.data.alerts[i].title].time) {
                    alerts[props.data.alerts[i].title] = props.data.alerts[i];
                }
            } else {
                alerts[props.data.alerts[i].title] = props.data.alerts[i];
            }
        }
    
        for (let alert in alerts) {
            if (alerts.hasOwnProperty(alert)) {
                alertList.push(alerts[alert]);
            }
        }
    }
    
    return <Week data={props.data.daily} timezone={props.data.timezone} alert={alertList}/>
}

const mapStateToProps = state => {
    return {
        data: state.data
    }
}

export default connect(mapStateToProps)(WeekContainer);