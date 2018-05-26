import axios from 'axios';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import addDataAction from '../../../actions/addDataAction'
import showBodyAction from '../../../actions/showBodyAction'

import Form from './Form';

class FormContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            location: "",
        }

        this.locationChange = this.locationChange.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.axiosCall = this.axiosCall.bind(this);
        this.addDataToStore = this.addDataToStore.bind(this);
    }

    locationChange(event) {
        this.setState({location: event.target.value});
    }

    submitForm(event) {
        event.preventDefault();
        this.axiosCall(this.state.location);
    }

    axiosCall(locationInput) {
        axios.post("/weather", {location: locationInput}).then((response) => {
            this.addDataToStore(response.data);
        }).catch((error) => {
            console.log(error);
            alert("Error retrieving data! Try again later!");
        });
    }

    addDataToStore(data) {
        this.props.showBodyAction();
        this.props.addDataAction(data);
    }

    render() {
        return (<Form location={this.state.location} onchange={this.locationChange} onsubmit={this.submitForm}/>);
    }
}

const mapStateToProps = state => {
    return {
        data: state.data,
        showBody: state.showBody
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        addDataAction: (data) => dispatch(addDataAction(data)),
        showBodyAction: () => dispatch(showBodyAction())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FormContainer);
