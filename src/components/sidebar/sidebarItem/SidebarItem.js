import React from 'react';

import './SidebarItem.css';

function SidebarItem(props) {
 
  let itemClass = "sidebar-item sidebar-item-";
  if (props.id === props.sidebar) {
    itemClass += "selected"
  } else {
    itemClass += "unselected";
  }
 
  return (
    <div id={props.id + "_id"} className={itemClass} data-page={props.page} onClick={props.click}>
      <svg className="sidebar-img sidebar-item-part" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45"></circle>
        <path d="M50 95 Q0 50 50 5 Q100 50 50 95"></path>
        <path d="M15 20 Q50 50 85 20"></path>
        <path d="M15 80 Q50 50 85 80"></path>
      </svg>
      <div className="sidebar-item-part">
        {props.id[0].toUpperCase() + props.id.slice(1)}
      </div>
    </div>
  );
}

export default SidebarItem;
