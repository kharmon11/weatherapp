import React from 'react';

import './Spinner.css';


function Spinner(props) {
  const spinnerStyle = {
    display: "None",
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    height: "100px",
    width: "100px"
  }
  return (
    <svg  id={props.spinnerId}  className="spinner" viewBox="0 0 100 100" style={spinnerStyle}>
      <circle id="circle1" className="circle circle1" cx="50" cy="15" r="12"></circle>
      <circle id="circle2" className="circle circle2" cx="75" cy="25" r="12"></circle>
      <circle id="circle3" className="circle circle3" cx="85" cy="50" r="12"></circle>
      <circle id="circle4" className="circle circle4" cx="75" cy="75" r="12"></circle>
      <circle id="circle5" className="circle circle5" cx="50" cy="85" r="12"></circle>
      <circle id="circle6" className="circle circle6" cx="25" cy="75" r="12"></circle>
      <circle id="circle7" className="circle circle7" cx="15" cy="50" r="12"></circle>
      <circle id="circle8" className="circle circle8" cx="25" cy="25" r="12"></circle>
    </svg>
  )
}

export default Spinner;