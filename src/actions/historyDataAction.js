const historyDataAction = function(data) {
    return {
        type: "ADD_HISTORY_DATA",
        value: data
    }
}
export default historyDataAction;