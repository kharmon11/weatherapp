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
    const body = document.getElementById("body");
    if (this.state.width <= 761) {
      if (this.props.sidebar === "overview") {
        body.style.maxHeight = "";
      } else {
        body.style.maxHeight = "960px";
      }
    } else {
      if (this.props.sidebar === "overview") {
        body.style.maxHeight = "";
      } else {
        body.style.maxHeight = "990px";
      }
    }
  }

  render() {
    return (<Body sidebar={this.props.sidebar}/>);
  }
}

const mapStateToProps = state => {
  return {sidebar: state.sidebar};
}

export default connect(mapStateToProps)(BodyContainer);
