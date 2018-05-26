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
        this.dateValidation = this.dateValidation.bind(this);
        this.dayMonthValidation = this.dayMonthValidation.bind(this);
    }

    submit(event) {
        const rawDate = document.getElementById("date_input").value;
        if (this.dateValidation(rawDate)) {
            const date = new Date(rawDate);
            const timeStamp = (date.getTime() + 43200000) / 1000;
            if (timeStamp + 43200 < Date.now() / 1000) {
                this.callServer(timeStamp);
            } else {
                alert("Date error! Submitted date can not be in the future!");
            }
        } else {
            alert("Invalid date! Try using this format: mm/dd/yyyy");
        }
    }

    dateValidation(rawDate) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
            const dateSplit = rawDate.split("-");
            return this.dayMonthValidation(dateSplit, {day: 2, month: 1});
        } else {
            if (/\d{2}\/\d{2}\/\d{4}/.test(rawDate)) {
                const dateSplit = rawDate.split("/");
                return this.dayMonthValidation(dateSplit, {day: 1, month: 0});
            } else {
                return false;
            }
        }
    }

    dayMonthValidation(dateSplit, indexObj) {
        if (Number(dateSplit[indexObj.month]) < 13 && Number(dateSplit[indexObj.day]) < 32) {
            return true;
        } else {
            return false;
        }
    }

    callServer(timestamp) {
        axios.post("/history", {timestamp,lat: this.props.lat, lon: this.props.lon}).then((response) => {
            this.props.historyData(response.data);
        }).catch((error) => {
            console.log(error);
            alert("Error retrieving data! Try again later!");
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