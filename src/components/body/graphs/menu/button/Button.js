import React from 'react';

import './Button.css';

function Button(props) {
    return (
        <button id={props.id} className="menu-btn" data-type={props.type} onClick={props.onclick}>{props.title}</button>
    );
}


export default Button;
