import React from 'react';

import './PartlyCloudyNight.css';

function PartlyCloudyNight(props) {
	return (
		<g className="partly-cloudy-night">
			<title>Partly Cloudy</title>
			<path className="moon" d="M70 10 A 20 20 0 1 0 85 45 A12 15 0 1 1 70 10"></path>
			<circle cx="20" cy="70" r="20px" fill="#888"></circle>
			<circle cx="50" cy="65" r="25px" fill="#888"></circle>
			<circle cx="80" cy="75" r="15px" fill="#888"></circle>
		</g>
	);
}
export default PartlyCloudyNight;
