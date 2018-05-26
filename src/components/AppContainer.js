import React from 'react';
import {connect} from 'react-redux';
import App from './App';

function AppContainer(props) {
  return (<App showBody={props.showBody}/>);
}

const mapStateToProps = (state) => {
  return {
    showBody: state.showBody
  }
}
export default connect(mapStateToProps)(AppContainer);