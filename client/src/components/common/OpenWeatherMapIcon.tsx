import React from 'react'

interface OpenWeatherMapIconProps {
    description: string;
    icon: string;
    style?: React.CSSProperties;
}

export default function OpenWeatherMapIcon({description, icon, style = {}}: OpenWeatherMapIconProps) {
    return (
        <img
            alt={description}
             title={description}
             src={`https://openweathermap.org/img/wn/${icon}.png`}
             style={style}
        />
    )
}