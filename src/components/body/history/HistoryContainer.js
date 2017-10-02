import React from 'react';
import {connect} from 'react-redux';

import History from './History';

function HistoryContainer(props) {
    return <History location={props.city + ", " + props.state + " " + props.country} timezone={props.timezone} history={props.history}/>
}

const mapStateToProps = state => {
    return {
        city: state.data.city,
        state: state.data.state,
        country: state.data.country,
        timezone: state.data.timezone,
        history: state.history
    }
}

export default connect(mapStateToProps)(HistoryContainer);