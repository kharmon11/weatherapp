import React, {Component} from 'react';

import '../icons.css';
import './Snow.css';

class Snow extends Component {
  constructor(props) {
    super(props);

    this.createCoordArray = this.createCoordArray.bind(this);
    this.createFlakes = this.createFlakes.bind(this);
  }
  createCoordArray() {
    let coords = {
      x1: [],
      y1: [
        55, 58, 72
      ],
      x2: [],
      y2: [75, 72, 58]
    }
    for (let i = 0; i < 4; i++) {
      coords.x1.push(20 + (17 * i), 13 + (17 * i), 13 + (17 * i));
      coords.y1.push(55, 58, 72);
      coords.x2.push(20 + (17 * i), 27 + (17 * i), 27 + (17 * i));
      coords.y2.push(75, 72, 58);
    }
    return coords;
  }

  createFlakes() {
    const coords = this.createCoordArray();
    let flakes = [];
    for (let i = 0; i < coords.x1.length; i++) {
      flakes.push((
        <line className="snowflake" x1={coords.x1[i]} y1={coords.y1[i]} x2={coords.x2[i]} y2={coords.y2[i]}></line>
      ));
    }
    return flakes;
  }
  render() {
    const flakes = this.createFlakes();

    return (
      <g className="snowy">
        <title>Snow</title>
        <circle cx="20" cy="30" r="20px" fill="#888"></circle>
        <circle cx="50" cy="25" r="25px" fill="#888"></circle>
        <circle cx="80" cy="35" r="15px" fill="#888"></circle>
        {flakes}
      </g>
    );
  }
}
export default Snow;
