import React from 'react';

import './Form.css';

function Form(props) {
  return (
    <form id="app_form" method="post" onSubmit={props.onsubmit}>
      <div id="input_elements">
        <input id="location_field" type="text" name="location" placeholder="Enter Location" onChange={props.onchange} autoFocus/>
        <button id="submit" type="submit" name="submit">Submit</button>
      </div>
    </form>
  )
}

export default Form;
