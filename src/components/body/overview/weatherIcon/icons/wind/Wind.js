import React from 'react';

import '../icons.css';
import './Wind.css';

function Wind(props) {
	return (
		<g className="wind">
			<title>Windy</title>
			<path className="windLine" d="M5 50 H 80 A 8 8 85 1 0 75 35"></path>
			<path className="windLine" d="M15 40 H 55 A 12 12 45 1 0 38 28"></path>
			<path className="windLine" d="M20 60 H 60 A 11 11 0 1 1 48 77"></path>
		</g>
	);
}
export default Wind;
