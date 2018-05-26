const overallGraphsReducer = function(state = "today", action) {
    switch(action.type) {
        case "TOGGLE_OVERALL_GRAPHS":
            return action.value;
        default:
            return state;
    }
}
export {overallGraphsReducer};