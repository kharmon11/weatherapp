import React, {Component} from 'react';

import ButtonContainer from './button/ButtonContainer';

import './Menu.css';

class Menu extends Component {
    componentDidMount() {
      if (this.props.config.css) {
          const button = document.getElementById(this.props.config.name + "_menu");
          for (let cssStyle in this.props.config.css) {
              if (this.props.config.css.hasOwnProperty(cssStyle)) {
                  button.style[cssStyle] = this.props.config.css[cssStyle];
              }
          }
      }
    }
    render() {
        let buttons = this.props.config.buttons.array.map((button) => {
            return <ButtonContainer name={button.name} type={this.props.config.name} onclick={this.props.config.onclick} css={this.props.config.buttons.css}/>;
        });
        return (
            <div id={this.props.config.name + "_menu"} className="graph-menus">
                {buttons}
            </div>
        );
    }
}

export default Menu;