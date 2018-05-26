const addDataReducer = function(state = false, action) {
  switch (action.type) {
    case "ADD_DATA":
      return action.value;
    default:
      return state;
  }
}

export {addDataReducer};
