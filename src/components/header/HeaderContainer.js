import React, {Component} from 'react';
import {connect} from 'react-redux'

import Header from './Header';

class HeaderContainer extends Component {
  render() {
    if (this.props.showBody) {
      document.getElementById("header").style["height"] = "100px";
      document.getElementById("header").style["display"] = "block";
      document.getElementById("app_form_div_wrapper").style["margin"] = "auto";
    }
    return (<Header/>)
  }
}

const mapStateToProps = (state) => {
  return {
    showBody: state.showBody
  }
}

export default connect(mapStateToProps)(HeaderContainer);