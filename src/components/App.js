import React from 'react';

import HeaderContainer from "./header/HeaderContainer";
import Sidebar from './sidebar/Sidebar';
import BodyContainer from './body/BodyContainer';
import Footer from './footer/Footer';

import './App.css';

function App(props) {
  let main;
  if (props.showBody) {
    main = (
      <div id="main">
        <Sidebar/>
        <BodyContainer/>
      </div>
    );
  } else {
    main = "";
  }
  return (
    <div id="App">
      <HeaderContainer/>
      {main}
      <Footer/>
    </div>
  );
}
export default App;
