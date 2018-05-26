import React from 'react';

import '../icons.css';
import './Rain.css';

function Rain(props) {
  return (
    <g className="rainy">
      <title>Rain</title>
      <circle cx="20" cy="30" r="20px" fill="#888"></circle>
      <circle cx="50" cy="25" r="25px" fill="#888"></circle>
      <circle cx="80" cy="35" r="15px" fill="#888"></circle>
      <line x1="17" y1="55" x2="10" y2="83" className="rain"></line>
      <line x1="25" y1="60" x2="20" y2="80" className="rain"></line>
      <line x1="37" y1="55" x2="30" y2="83" className="rain"></line>
      <line x1="45" y1="60" x2="40" y2="80" className="rain"></line>
      <line x1="57" y1="55" x2="50" y2="83" className="rain"></line>
      <line x1="65" y1="60" x2="60" y2="80" className="rain"></line>
      <line x1="77" y1="55" x2="70" y2="83" className="rain"></line>
    </g>
  );
}
export default Rain;
