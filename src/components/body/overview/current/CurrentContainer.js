import React, {Component} from 'react';
import {connect} from 'react-redux';

import Current from './Current';

import './Current.css';

class CurrentContainer extends Component {
  componentDidMount() {
    const icon = document.getElementById("wx_icon_current");
    icon.style.width = "100px";
    icon.style.height = "100px";
  }
  render() {
    return (
      <Current currently={this.props.data.currently} today={this.props.data.daily.data[0]}/>
    );
  }
}

const mapStateToProps = state => {
    return {data: state.data};
}

export default connect(mapStateToProps)(CurrentContainer);
