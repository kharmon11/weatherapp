import React from 'react';

import './HistoryGraphs.css';

function HistoryGraphs(props) {
    if (props.history) {
        return (
            <div id="canvas_container">
                <div id="graph_place">{props.place}</div>
                <div className="canvas_wrapper">
                    <canvas id="canvas_temp" height="300" width="500"></canvas>
                </div>
                <div className="canvas_wrapper">
                    <canvas id="canvas_precip" height="300" width="500"></canvas>
                </div>
                <div className="canvas_wrapper">
                    <canvas id="canvas_wind" height="300" width="500"></canvas>
                </div>
            </div>
        );
    } else {
        return <div id="canvas_cpntainer"></div>
    }
}
export default HistoryGraphs;