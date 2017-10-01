import axios from 'axios';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import historyDataAction from '../../../../actions/historyDataAction';

import HistoryForm from './HistoryForm';

class HistoryFormContainer extends Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
        this.callServer = this.callServer.bind(this);
    }

    submit(event) {
        const rawDate = document.getElementById("date_input").value;
        const date = new Date(rawDate);
        this.callServer(date.getTime()/1000);
    }

    callServer(timestamp) {
        axios.post("/history", {timestamp,lat: this.props.lat, lon: this.props.lon}).then((response) => {
            this.props.historyData(response.data);
        }).catch((error) => {
            console.log(error);
            // alert("Error retrieving data! Try again later!");
        });
    }

    render() {
        return <HistoryForm submit={this.submit}/>;
    }
}

const mapStateToProps = state => {
    return {
        lat: state.data.latitude,
        lon: state.data.longitude,
        history: state.history
    }
}

const mapDispatchToProps = dispatch => {
    return {
        historyData: (data) => dispatch(historyDataAction(data))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoryFormContainer);