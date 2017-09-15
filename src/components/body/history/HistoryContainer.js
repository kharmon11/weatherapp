import React from 'react';
import {connect} from 'react-redux';

import History from './History';

function HistoryContainer(props) {
    return <History location={props.city + ", " + props.state + " " + props.country}/>
}

const mapStateToProps = state => {
    return {
        city: state.data.city,
        state: state.data.state,
        country: state.data.country
    }
}

export default connect(mapStateToProps)(HistoryContainer);