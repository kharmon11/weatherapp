import React from 'react';

import Logo from '../logo/Logo';

import './Footer.css';

function Footer(props) {
  return (
    <div id="footer">
      <div className="footer-section">
        <a id="footer_link" href="https://kenharmon.net">
          <Logo/>
        </a>

      </div>
      <div className="footer-section">
      &copy;2017 Ken Harmon
      </div>
    </div>
  );
}
export default Footer;
