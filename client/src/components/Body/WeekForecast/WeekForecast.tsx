import "./WeekForecast.sass"
import OpenWeatherMapIcon from "../../common/OpenWeatherMapIcon.tsx";

import type {DailyForecast} from "../../../types/openweathermap.ts";

interface WeekForecastProps {
    daily: DailyForecast[];
    timezone: string;
}

const dateTimeString = (dt: number, timezone: string) => {
    const date = new Date(dt * 1000)
    return date.toLocaleString("en-US", {timeZone: timezone, month: "short", day: "numeric", weekday: "short"})
}

const openWeatherMapIconStyle = {
    background: "rgba(100, 100, 255, 0.2)",
    borderRadius: "20px"
}

export default function WeekForecast({daily, timezone}: WeekForecastProps) {
    return (
        <div className={"week-forecast panel"}>
            {daily.map((day) => (
                <div className={"day-forecast"} key={day.dt}>
                    <div className={"day-datetime"}>{dateTimeString(day.dt, timezone)}</div>
                    <div className={"day-temp-moisture-wrapper"}>
                        <div className={"day-forecast-temps"}>
                            <div className={"day-forecast-data"} title={"High temperature"}>
                                <span className={"day-forecast-label"}>Hi: </span>
                                <span className={"day-forecast-temp-high"}>{Math.round(day.temp.max)}&deg;F</span>
                            </div>
                            <div className={"day-forecast-data"} title={"Low temperature"}>
                                <span className={"day-forecast-label"}>Lo: </span>
                                <span className={"day-forecast-temp-low"}>{Math.round(day.temp.min)}&deg;F</span>
                            </div>
                        </div>
                        <div className={"day-forecast-moisture"}>
                            <div className={"day-forecast-data"} title={"Dewpoint"}>
                                <span className={"day-forecast-label"}>Dew: </span>
                                <span className={"day-forecast-dewpoint"}>{Math.round(day.dew_point)}&deg;F</span>
                            </div>
                            <div className={"day-forecast-data"} title={"Probability of precipitation"}>
                                <span className={"day-forecast-label"}>Precip: </span>
                                <span className={"day-forecast-pop"}>{day.pop * 100}%</span>
                            </div>
                        </div>
                    </div>
                    <div className={"day-wind"}>
                        <span className={"day-forecast-label"}>Wind/Gust: </span>
                        <span className={"day-forecast-wind"}>{Math.round(day.wind_speed)}</span> / <span
                        className={"day-forecast-wind"}>{Math.round(day.wind_gust)}</span>
                    </div>
                    <div className={"day-summary"}>
                        <OpenWeatherMapIcon description={day.weather[0].description} icon={day.weather[0].icon}
                                            style={openWeatherMapIconStyle}/>{day.summary}
                    </div>
                </div>
            ))}
        </div>
    )
}