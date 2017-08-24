import React from 'react';

import './OtherRow.css';

function OtherRow(props) {
    let col2;
    if (props.col2) {
        col2 = props.col2;
    } else {
        col2 = "N/A";
    }
    return (
        <div className="other-row">
            <div className="other-row-cell">{props.col1}</div>
            <div className="other-row-cell">{col2}</div>
        </div>
    );
} 
export default OtherRow;