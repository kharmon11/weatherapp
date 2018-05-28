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
        this.nearbyClick = this.nearbyClick.bind(this);
        this.showSpinner = this.showSpinner.bind(this);
        this.hideSpinner = this.hideSpinner.bind(this);
        this.axiosCall = this.axiosCall.bind(this);
        this.addDataToStore = this.addDataToStore.bind(this);
    }

    locationChange(event) {
        this.setState({location: event.target.value});
    }

    submitForm(event) {
        event.preventDefault();
        this.showSpinner();
        this.axiosCall("/weather", {searchParam: "address",location: this.state.location});
    }

    nearbyClick(event) {
        event.preventDefault();
        this.showSpinner();
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.axiosCall("/weather", {searchParam: "address",location: position.coords.latitude + "," + position.coords.longitude})
              });
          } else {
            alert("Geolocation is not available for your browser! Try searching for a location manually.");
            this.hideSpinner();
          }
    }

    showSpinner() {
        document.getElementById("search_spinner").style.display = "Flex"
    }

    hideSpinner() {
        document.getElementById("search_spinner").style.display = "None"
    }

    axiosCall(endpoint, searchData) {
        axios.post(endpoint, searchData).then((response) => {
            this.addDataToStore(response.data);
            this.hideSpinner();
        }).catch((error) => {
            console.log(error);
            alert("Error retrieving data! Try again later!");
            this.hideSpinner();
        });
    }

    addDataToStore(data) {
        this.props.showBodyAction();
        this.props.addDataAction(data);
    }

    render() {
        return (<Form location={this.state.location} onchange={this.locationChange} onsubmit={this.submitForm} nearby={this.nearbyClick}/>);
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
