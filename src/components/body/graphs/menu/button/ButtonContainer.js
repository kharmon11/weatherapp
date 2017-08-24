import React, {Component} from 'react';
import {connect} from 'react-redux';

import overallGraphsAction from '../../../../../actions/overallGraphsAction';

import Button from './Button';

class ButtonContainer extends Component {
    constructor(props) {
        super(props);
        this.dispatchGraphAction = this.dispatchGraphAction.bind(this);
        this.buttonClass = this.buttonClass.bind(this);
        this.buttonClick = this.buttonClick.bind(this);
    }

    componentDidMount() {
        if (this.props.css) {
            const button = document.getElementById(this.props.name + "_btn");
            for (let cssStyle in this.props.css) {
                if (this.props.css.hasOwnProperty(cssStyle)) {
                    button.style[cssStyle] = this.props.css[cssStyle];
                }
            }
        }
        this.buttonClass();
    }

    buttonClass() {
        const btns = document.getElementsByClassName("menu-btn");
        for (let i=0; i<btns.length; i++) {
            if (btns[i].dataset.type === "overall") {
                if (this.props.overall === btns[i].id.slice(0,-4)) {
                    btns[i].className = "menu-btn menu-btn-selected"
                } else {
                    btns[i].className = "menu-btn";
                }
            }
        }
    }

    buttonClick(event) {
        this.dispatchGraphAction(event).then(() => {
            this.buttonClass();
        })
    }

    dispatchGraphAction(event) {
        return new Promise((resolve, reject) => {
            this.props.overallGraphsAction(event.target.id.slice(0,-4));
            resolve();
        })
    }

    render() {
        let title = "";
        if (this.props.name.includes("_")) {
            const split = this.props.name.split("_");
            for (let i=0; i<split.length; i++) {
                title += (split[i][0].toUpperCase() + split[i].slice(1));
                if (i < split.length - 1) {
                    title += " ";
                }
            }
        } else {
            title = this.props.name[0].toUpperCase() + this.props.name.slice(1);
        }

        return (
            <Button id={this.props.name + "_btn"} type={this.props.type} onclick={this.buttonClick} title={title}/>
        );
    }
}

const mapStateToProps = state => {
    return {overall: state.overall};
}

const mapDispatchToProps = (dispatch) => {
    return {
        overallGraphsAction: (data) => dispatch(overallGraphsAction(data)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ButtonContainer);