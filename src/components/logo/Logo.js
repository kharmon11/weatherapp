import React from 'react';

import './Logo.css';

function Logo(props) {
    return (
        <svg id="footer_logo" viewBox="0 0 100 100" height="50" width="50">
            <path id="logo-diamond" d="M50 0 L100 50 L50 100 L0 50 Z"></path>
            <text className="logo-text" x="5" y="70">K</text>
            <text className="logo-text" x="45" y="80">H</text>
        </svg>
    )
}
export default Logo;