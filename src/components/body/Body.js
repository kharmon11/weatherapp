import React from 'react';

import OverviewContainer from './overview/OverviewContainer';
import GraphsContainer from './graphs/GraphsContainer';

import './Body.css';

function Body(props) {
  let body;
  if (props.sidebar === "overview") {
    body = <OverviewContainer/>;
  } else {
    body = <GraphsContainer/>
  }
  return (
    <div id="body">{body}</div>
  );
}
export default Body;
