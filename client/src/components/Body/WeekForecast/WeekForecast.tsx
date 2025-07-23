import "./WeekForecast.sass"
import React, {Suspense, lazy} from "react"
import DailyForecasts from "./DailyForecasts"
import type {DailyForecast} from "../../../types/openweathermap.ts"
// import WeekGraphs from "./WeekGraphs"
const WeekGraphs = lazy(() => import("./WeekGraphs"))

interface WeekForecastProps {
  daily: DailyForecast[]
  timezone: string
}

export default function WeekForecast({daily, timezone}: WeekForecastProps) {
  const weekForecastClickHandler = (event: React.MouseEvent<HTMLDivElement>) => {
    const parent = event.currentTarget.closest(".week-forecast")
    if (!parent) return

    const btns = parent.querySelectorAll(".week-forecast-btn")
    const panels = parent.querySelectorAll(".week-forecast-panel")

    // Toggle buttons
    btns.forEach(btn => {
      btn.classList.toggle("week-forecast-btn-active")
      btn.classList.toggle("week-forecast-btn-inactive")
    })

    // Toggle panels
    panels.forEach(panel => {
      panel.classList.toggle("week-forecast-panel-active")
      panel.classList.toggle("week-forecast-panel-inactive")
    })
  }

  return (
    <div className={"week-forecast panel"}>
      <div className={"week-forecast-toggle"}>
        <div
          onClick={weekForecastClickHandler}
          className={"week-forecast-btn week-forecast-btn-active"}
        >
          Forecast
        </div>

        <div
          onClick={weekForecastClickHandler}
          className={"week-graphs-btn week-forecast-btn week-forecast-btn-inactive"}
        >
          Graphs
        </div>
      </div>
      <div className={"daily-forecasts-wrapper week-forecast-panel week-forecast-panel-active"}>
        <DailyForecasts daily={daily} timezone={timezone}/>
      </div>
      <Suspense>
        <div className={"daily-graphs-wrapper week-forecast-panel week-forecast-panel-inactive"}>
          <WeekGraphs daily={daily} timezone={timezone}/>
        </div>
      </Suspense>
    </div>
  )
}