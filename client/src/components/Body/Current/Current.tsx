import './Current.sass';
import WindVane from "./WindVane.tsx";
import OpenWeatherMapIcon from "../../common/OpenWeatherMapIcon.tsx";

import type {CurrentWeather} from "../../../types/openweathermap.ts";

interface CurrentProps {
    current: CurrentWeather;
    timezone: string;
    location_text: string;
}

// Create current datetime string
const currentDatetimeString = (dt: number, timezone: string) => {
    const date = new Date(dt * 1000)
    const datetimeString = date.toLocaleString("en-US", {
        timeZone: timezone, month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true
    })
    const formatter = new Intl.DateTimeFormat("en-US", {timeZone: timezone, timeZoneName: "short"})
    const parts = formatter.formatToParts(date)
    const timeZoneAbbreviation = parts.find(part => part.type === "timeZoneName")?.value || ""
    return `${datetimeString} ${timeZoneAbbreviation}`
}

export default function Current({current, timezone, location_text}: CurrentProps) {
    return (
        <div className="current panel">
            <div className={"data-info"}>
                <span className={"current-time"}>{currentDatetimeString(current.dt, timezone)}</span>
                <span className={"location-name"}>{location_text}</span>
            </div>
            <div className={"current-weather"}>
                <div className={"current-temp-humidity"}>
                    <div className={"temp-circle"}>
                        <div className={"temp-display"}
                             title={`Current temperature ${Math.round(current.temp)}\u00B0F`}>{Math.round(current.temp)}&deg;</div>
                        <div className={"feels-like-display"}>
                                    <span
                                        className={"feels-like-text"}>FEELS</span> {Math.round(current.feels_like)}&deg;
                        </div>
                    </div>
                    <div className={"current-humidity subpanel"}>
                        <div>Dew Point: {Math.round(current.dew_point)}&deg;F</div>
                        <div>Humidity: {current.humidity}%</div>
                    </div>
                </div>
                <div className={"current-wind"}>
                    <WindVane windDirection={current.wind_deg}/>
                    <div className={"current-wind-speeds subpanel"}>
                        <div>Speed: {Math.round(current.wind_speed)}mph</div>
                        {current.wind_gust !== undefined && (
                            <div>Gusts: {Math.round(current.wind_gust)}mph</div>
                        )}
                    </div>
                </div>
                <div className={"current-weather-other"}>
                    <div className={"current-conditions-description"}>
                        {current.weather[0].description}
                        <OpenWeatherMapIcon description={`Current conditions: ${current.weather[0].description}`} icon={current.weather[0].icon}/>
                    </div>
                    <div className={"current-other-data subpanel"}>
                        <div>Clouds: {current.clouds}%</div>
                        <div>Pressure: {current.pressure}mb</div>
                    </div>
                </div>
            </div>
        </div>
    )
}