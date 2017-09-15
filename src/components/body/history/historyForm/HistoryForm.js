import React from 'react';

import './HistoryForm.css';

function HistoryForm(props) {
    return (
        <div id="history_form">
            <input type="date" id="date_input" name="date_input"/>
            <button id="date_input_btn">Submit</button>
        </div>
    );
}
export default HistoryForm;