import React, {Component} from 'react';
import {connect} from 'react-redux'

import sidebarAction from '../../../actions/sidebarActions';

import SidebarItem from './SidebarItem';

class SidebarItemContainer extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick(event) {
        const value = event.currentTarget.getAttribute("data-page");
        this.props.sidebarAction(value)
    }

    render() {
        return (
            <SidebarItem id={this.props.id} page={this.props.id} click={this.onClick} sidebar={this.props.sidebar}/>);
    }
}

const mapStateToProps = state => {
    return {sidebar: state.sidebar};
}

const mapDispatchToProps = (dispatch) => {
    return {
        sidebarAction: (value) => dispatch(sidebarAction(value))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SidebarItemContainer);
