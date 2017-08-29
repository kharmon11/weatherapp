import React from 'react';
import {connect} from 'react-redux';

import Current from './Current';

import './Current.css';

function CurrentContainer(props) {
  return (
    <Current currently={props.data.currently} today={props.data.daily.data[0]}/>
  );
}

const mapStateToProps = state => {
    return {data: state.data};
}

export default connect(mapStateToProps)(CurrentContainer);
