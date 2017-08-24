import React from 'react';
import {connect} from 'react-redux';
import Body from './Body';

function BodyContainer(props) {
  return (<Body sidebar={props.sidebar}/>);
}

const mapStateToProps = state => {
  return {sidebar: state.sidebar};
}

export default connect(mapStateToProps)(BodyContainer);
