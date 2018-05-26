import React from 'react';

import './Map.css';

function Map(props) {

    return (
        <iframe width="300" height="240" frameborder="0" title="Current Map" src={"https://www.google.com/maps/embed/v1/place?key=AIzaSyDazkofjrWcOTWtYm2AHv74MW7U0JGaGgc&q=" + props.lat + "," + props.lon}></iframe>
    );
}

export default Map;