import React from 'react';

import '../icons.css';
import './Cloud.css';

function Cloud(props) {
  return (
    <g class="cloud">
      <title>Overcast</title>
      <circle cx="20" cy="30" r="20px" fill="#888"></circle>
      <circle cx="50" cy="25" r="25px" fill="#888"></circle>
      <circle cx="80" cy="35" r="15px" fill="#888"></circle>
    </g>
  );
}
export default Cloud;
