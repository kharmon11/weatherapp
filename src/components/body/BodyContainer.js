import React, {Component} from 'react';
import {connect} from 'react-redux';
import Body from './Body';

class BodyContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { width: '0', height: '0' };

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.setBodyHeight = this.setBodyHeight.bind(this);
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
    this.setBodyHeight();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  componentDidUpdate() {
    this.setBodyHeight();
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  setBodyHeight() {
    const main= document.getElementById("main");
    const body = document.getElementById("body");
    if (this.state.width <= 721) {
      if (this.props.sidebar === "overview") {
        // main.style.height = "1070px";
        body.style["max-height"] = "1070px";
      } else {
        // main.style.height = "960px";
        body.style["max-height"] = "960px";
      }
    } else {
      if (this.props.sidebar === "overview") {
        // main.style.height = "580px";
        body.style["max-height"] = "580px";
      } else {
        // main.style.height = "990px";
        body.style["max-height"] = "990px";
      }
    }
  }

  render() {
    // if (document.getElementById("body")) {
    //   this.setBodyHeight();
    // }
    // const bodyStyle = {
    //   height: ""
    // }
    // if (this.props.sidebar ==)
    return (<Body sidebar={this.props.sidebar}/>);
  }
}

// function BodyContainer(props) {
//   return (<Body sidebar={props.sidebar}/>);
// }

const mapStateToProps = state => {
  return {sidebar: state.sidebar};
}

export default connect(mapStateToProps)(BodyContainer);
