import React from 'react';

import './WindVane.css';

function WindVane(props) {
    return (
        <div id="wind_vane_current" className="wind-vane current-wx">
            <svg id="wind_vane_image_current" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
                <circle className="wind-vane-circle" cx="100" cy="100" r="80" stroke="black" fill="transparent"></circle>
                <circle className="wind-vane-circle" cx="100" cy="100" r="60" stroke="black" fill="transparent"></circle>
                <g id="wind_vane_arrow_current" transform={"rotate(" + props.windBearing + ",100,100)"}>
                    <polyline className="wind-vane-arrow-tail" points="81 21 100 40 119 21 100 60 81 21" stroke="red" fill="red"></polyline>
                    <line className="wind-vane-arrow-body" x1="100" y1="40" x2="100" y2="170" stroke="red"></line>
                    <polyline className="wind-vane-arrow-head" points="81 151 100 170 119 151" stroke="red" fill="red"></polyline>
                    <circle cx="100" cy="100" r="6" fill="black"></circle>
                </g>
                <g id="wind_direction_text">
                    <text className="wind-direction" text-anchor="middle" x="100" y="15">N</text>
                    <text className="wind-direction" text-anchor="middle" x="100" y="200">S</text>
                    <text className="wind-direction" text-anchor="middle" x="0" y="100">W</text>
                    <text className="wind-direction" text-anchor="middle" x="185" y="100">E</text>
                </g>
            </svg>
        </div>
    );
}
export default WindVane;