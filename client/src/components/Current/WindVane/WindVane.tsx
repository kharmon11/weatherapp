import './WindVane.sass'
import React from 'react'

interface WindVaneProps {
    windDirection: number
}

const WindVane: React.FC<WindVaneProps> = ({windDirection}) => {
    return (
        <div className={"wind-vane"}>
            <svg className={"wind-vane-image"} viewBox={"0 0 200 200"} preserveAspectRatio="xMidYMid meet">
                <circle className={"wind-vane-circle"} cx={"100"} cy={"100"} r={"80"} stroke={"black"}
                        fill={"transparent"}></circle>
                <circle className={"wind-vane-circle"} cx={"100"} cy={"100"} r={"60"} stroke={"black"}
                        fill={"transparent"}></circle>
                <g className={"wind-vane-arrow"} transform={`rotate(${windDirection}, 100, 100)`}>
                    <polyline className={"wind-vane-arrow-tail"} points="81 21 100 40 119 21 100 60 81 21" fill={"red"}
                              stroke={"red"}></polyline>
                    <line className="wind-vane-arrow-body" x1="100" y1="40" x2="100" y2="170" stroke="red"></line>
                    <polyline className="wind-vane-arrow-head" points="81 151 100 170 119 151" stroke="red"
                              fill="red"></polyline>
                    <circle cx="100" cy="100" r="6" fill="black"></circle>
                </g>
                <g className={"wind-direction-text"}>
                    <text className={"wind-direction"} textAnchor={"middle"} x={100} y={15}>N</text>
                    <text className={"wind-direction"} textAnchor={"middle"} x={100} y={198}>S</text>
                    <text className={"wind-direction"} textAnchor={"middle"} x={8} y={105}>W</text>
                    <text className={"wind-direction"} textAnchor={"middle"} x={187} y={105}>E</text>
                </g>
            </svg>
        </div>
    )
}

export default WindVane