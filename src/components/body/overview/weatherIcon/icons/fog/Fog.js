import React from 'react';

import './Fog.css';

function Fog(props) {
  return (
    <g className="foggy">
      <title>Fog</title>
      <circle cx="20" cy="30" r="20px" fill="#888"></circle>
      <circle cx="50" cy="25" r="25px" fill="#888"></circle>
      <circle cx="80" cy="35" r="15px" fill="#888"></circle>
      <rect className="fog-clear" x="0" y="40" height="60px" width="100px"></rect>
      <line className="fog-line" x1="5" y1="50" x2="95" y2="50"></line>
      <line className="fog-line" x1="5" y1="60" x2="95" y2="60"></line>
      <line className="fog-line" x1="5" y1="70" x2="95" y2="70"></line>
    </g>
  );
}
export default Fog;
