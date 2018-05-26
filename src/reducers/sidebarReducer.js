const sidebarReducer = function(state = "overview", action) {
  switch (action.type) {
    case "SIDEBAR_SELECT":
      return action.value;
    default:
      return state;
  }
}

export {sidebarReducer};
