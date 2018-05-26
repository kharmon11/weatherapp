import React from 'react';

import Menu from './menu/Menu';
import TodayContainer from './today/TodayContainer';
import LongTermContainer from './longTerm/longTermContainer';

import './Graphs.css';

function Graphs(props) {
  let overall;
  if (props.overall === "today") {
    overall = <TodayContainer/>;
  } else {
    overall = <LongTermContainer/>;
  }
  return (
    <div id="graphs">
      <Menu config={props.config}/>
      {overall}
    </div>
  );
}
export default Graphs;
