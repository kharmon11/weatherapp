import React from 'react';

import './Sleet.css';

function Sleet(props) {
	return (
		<g className="sleet">
			<title>Sleet</title>
			<circle cx="20" cy="30" r="20px" fill="#888"></circle>
			<circle cx="50" cy="25" r="25px" fill="#888"></circle>
			<circle cx="80" cy="35" r="15px" fill="#888"></circle>
			<circle className="sleet-item" cx="20" cy="60" r="5px"></circle>
			<circle className="sleet-item" cx="40" cy="60" r="5px"></circle>
			<circle className="sleet-item" cx="60" cy="60" r="5px"></circle>
			<circle className="sleet-item" cx="80" cy="60" r="5px"></circle>
			<circle className="sleet-item" cx="20" cy="80" r="5px"></circle>
			<circle className="sleet-item" cx="40" cy="80" r="5px"></circle>
			<circle className="sleet-item" cx="60" cy="80" r="5px"></circle>
			<circle className="sleet-item" cx="80" cy="80" r="5px"></circle>
		</g>
	);
}
export default Sleet;
