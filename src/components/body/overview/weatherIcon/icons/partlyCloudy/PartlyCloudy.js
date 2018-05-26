import React from 'react';

import '../icons.css';
import './PartlyCloudy.css';

function PartlyCloudy(props) {
  return (
    <g id="partly_cloudy" className="sunny">
      <title>Partly Cloudy</title>
      <circle cx="40" cy="50" r="20px" fill="#ff0"></circle>
      <line x1="40" y1="80" x2="40" y2="90" className="ray"></line>
      <line x1="40" y1="20" x2="40" y2="10" className="ray"></line>
      <line x1="70" y1="50" x2="80" y2="50" className="ray"></line>
      <line x1="10" y1="50" x2="0" y2="50" className="ray"></line>
      <line x1="61" y1="71" x2="75" y2="85" className="ray"></line>
      <line x1="19" y1="29" x2="5" y2="15" className="ray"></line>
      <line x1="19" y1="71" x2="5" y2="85" className="ray"></line>
      <line x1="61" y1="29" x2="75" y2="15" className="ray"></line>
      <circle cx="20" cy="70" r="20px" fill="#888"></circle>
      <circle cx="50" cy="65" r="25px" fill="#888"></circle>
      <circle cx="80" cy="75" r="15px" fill="#888"></circle>
    </g>
  );
}
export default PartlyCloudy;
