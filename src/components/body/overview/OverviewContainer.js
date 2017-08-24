import React from 'react';
import {connect} from 'react-redux';
import Overview from './Overview';

function OverviewContainer(props) {
    if (props.data) {
        return (<Overview data={props.data}/>);
    } else {
        return <div id="overview"></div>;
    }
}

const mapStateToProps = state => {
    return {data: state.data};
}

export default connect(mapStateToProps)(OverviewContainer);