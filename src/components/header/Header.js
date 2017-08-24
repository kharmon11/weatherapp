import React from 'react';

import FormContainer from './form/FormContainer';

import './Header.css';

import darkSky from './darksky.png';
import icon from './icon.png';

function Header(props) {
  
  return (
    <div id="header">
        <div id="header_info">
          <a className="image-link" href="https://kenharmon.net">
            <img id="icon_img" src={icon} alt="WxApp"/>
          </a>
          <div id="header_title">WxApp - Weather Forecast</div>
        </div>
        <div id="app_form_div">
          <a className="image-link" href="https://darksky.net/poweredby/">
            <img id="darksky_img" src={darkSky} alt="Dark Sky"/>
          </a>
          <FormContainer/>
        </div>
      </div>
  );
}
export default Header;
