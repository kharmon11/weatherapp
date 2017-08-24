import React from 'react';

import '../icons.css';
import './ClearNight.css';

function ClearNight(props) {
	return (
		<g className="clear-night">
			<title>Clear Night</title>
			<path className="moon" d="M70 10 A 40 40 0 1 0 100 80 A25 30 0 1 1 70 10"></path>
		</g>
	);
}
export default ClearNight;
