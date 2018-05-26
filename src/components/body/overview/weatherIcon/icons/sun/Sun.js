import React from 'react';

import '../icons.css';
import './Sun.css';

function Sun(props) {
  return (
    <g className="sun">
      <title>Sunny</title>
      <circle cx="50" cy="50" r="20px" fill="#ff0"></circle>
      <line x1="50" y1="80" x2="50" y2="90" className="ray"></line>
      <line x1="50" y1="20" x2="50" y2="10" className="ray"></line>
      <line x1="80" y1="50" x2="90" y2="50" className="ray"></line>
      <line x1="20" y1="50" x2="10" y2="50" className="ray"></line>
      <line x1="71" y1="71" x2="85" y2="85" className="ray"></line>
      <line x1="29" y1="29" x2="15" y2="15" className="ray"></line>
      <line x1="29" y1="71" x2="15" y2="85" className="ray"></line>
      <line x1="71" y1="29" x2="85" y2="15" className="ray"></line>
    </g>
  );
}
export default Sun;
