import React from 'react';

import OverviewContainer from './overview/OverviewContainer';
import GraphsContainer from './graphs/GraphsContainer';
import HistoryContainer from './history/HistoryContainer';

import './Body.css';

function Body(props) {
  let body;
  if (props.sidebar === "overview") {
    body = <OverviewContainer/>;
  } else if (props.sidebar === "graphs"){
    body = <GraphsContainer/>;
  } else {
    body = <HistoryContainer/>;
  }
  return (
    <div id="body">{body}</div>
  );
}
export default Body;
