import React from 'react';

import SidebarItemContainer from './sidebarItem/SidebarItemContainer';

import './Sidebar.css';

function Sidebar(props) {
  return (
    <div id="sidebar">
      <SidebarItemContainer id="overview"/>
      <SidebarItemContainer id="graphs"/>
    </div>
  );
}
export default Sidebar;
