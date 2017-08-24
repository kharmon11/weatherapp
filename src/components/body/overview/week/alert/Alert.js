import React from 'react';

import './Alert.css';

function Alert(props) {
    return (
        <div id={"week_alert_" + props.id} className="week-alert">
            <a href={props.alert.uri} target="_blank">{props.alert.title}</a>
        </div>
    );
}
export default Alert;