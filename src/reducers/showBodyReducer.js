const showBodyReducer = function(state = false, action) {
  switch (action.type) {
    case "SHOW_BODY":
      return action.value;
    default:
      return state;
  }
}

export {showBodyReducer};
