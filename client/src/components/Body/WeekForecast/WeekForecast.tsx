import "./WeekForecast.sass"
import {Suspense, lazy, useState} from "react"
import DailyForecasts from "./DailyForecasts"
import type {DailyForecast} from "../../../types/openweathermap.ts"

// WeekGraphs pulls in all of Recharts (the largest chunk in the app), and most
// users never open the Graphs tab, so it is only loaded and mounted on demand.
// The loader is shared so hovering the tab can warm the chunk before the click.
const loadWeekGraphs = () => import("./WeekGraphs")
const WeekGraphs = lazy(loadWeekGraphs)

type Tab = "forecast" | "graphs"

interface WeekForecastProps {
  daily: DailyForecast[]
  timezone: string
}

export default function WeekForecast({daily, timezone}: WeekForecastProps) {
  const [activeTab, setActiveTab] = useState<Tab>("forecast")
  // Once the graphs have been opened they stay mounted; later toggles just swap classes.
  const [graphsOpened, setGraphsOpened] = useState(false)

  const showGraphs = () => {
    setGraphsOpened(true)
    setActiveTab("graphs")
  }

  const state = (tab: Tab) => activeTab === tab ? "active" : "inactive"

  // Pointer-enter also fires when a touch begins, so this covers mouse and touch.
  const prefetchGraphs = () => {
    loadWeekGraphs().catch(() => {}) // best-effort warm-up: any real failure surfaces when the tab is opened
  }

  return (
    <div className={"week-forecast panel"}>
      <div className={"week-forecast-toggle"}>
        <div
          onClick={() => setActiveTab("forecast")}
          className={`week-forecast-btn week-forecast-btn-${state("forecast")}`}
        >
          Forecast
        </div>

        <div
          onClick={showGraphs}
          onPointerEnter={prefetchGraphs}
          className={`week-graphs-btn week-forecast-btn week-forecast-btn-${state("graphs")}`}
        >
          Graphs
        </div>
      </div>
      <div className={`daily-forecasts-wrapper week-forecast-panel week-forecast-panel-${state("forecast")}`}>
        <DailyForecasts daily={daily} timezone={timezone}/>
      </div>
      {graphsOpened && (
        <div className={`daily-graphs-wrapper week-forecast-panel week-forecast-panel-${state("graphs")}`}>
          <Suspense fallback={<div className={"week-graphs-loading"}>Loading graphs...</div>}>
            <WeekGraphs daily={daily} timezone={timezone}/>
          </Suspense>
        </div>
      )}
    </div>
  )
}
