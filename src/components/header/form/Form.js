import React from 'react';

import Spinner from '../../common/Spinner';

import './Form.css';

function Form(props) {
  return (
    <form id="app_form" method="post" onSubmit={props.onsubmit}>
      <div id="input_elements">
        <input id="location_field" type="text" name="location" placeholder="Enter Location" onChange={props.onchange} autoFocus/>
        <button id="submit" type="submit" name="submit">Submit</button>
        <button id="nearby" onClick={props.nearby}>Nearby</button>
      </div>
      <Spinner spinnerId="search_spinner"/>
    </form>
  )
}

export default Form;
