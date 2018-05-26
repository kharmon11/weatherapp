const historyDataReducer = function(state = false, action) {
    switch (action.type) {
      case "ADD_HISTORY_DATA":
        return action.value;
      default:
        return state;
    }
  }
  
  export {historyDataReducer};