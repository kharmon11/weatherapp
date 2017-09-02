import React from 'react';
import {connect} from 'react-redux';

import Map from './Map';

function MapClick(event) {
    
}

function MapContainer(props) {
    return <Map lat={props.data.latitude.toString()} lon={props.data.longitude.toString()} />
}

const mapStateToProps = state => {
    return {
        data: state.data
    }
}

export default connect(mapStateToProps)(MapContainer);