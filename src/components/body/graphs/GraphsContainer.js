import React from 'react';
import {connect} from 'react-redux';

import overallGraphsAction from '../../../actions/overallGraphsAction';

import Graphs from './Graphs';

function GraphsContainer(props) {
    const config = {
        name: "overall",
        css: {
          width: "70%",
          "font-size": "20px"
        },
        onclick: (event) => {
            props.overallGraphsAction(event.target.id.slice(0,-4));
        },
        buttons: {
          css: {
            flex: 1,
          },
          array: [
            {
              name: "today"
            },
            {
              name: "long_term"
            }
          ]
        }
      }

    return <Graphs config={config} overall={props.overall}/>;
}

const mapStateToProps = state => {
    return {overall: state.overall};
}

const mapDispatchToProps = (dispatch) => {
  return {
      overallGraphsAction: (data) => dispatch(overallGraphsAction(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GraphsContainer);