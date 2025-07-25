import "./WeekGraphs.sass"
import {
  ResponsiveContainer,
  Bar,
  ComposedChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import type {DailyForecast} from "../../../types/openweathermap";

interface WeekForecastProps {
  daily: DailyForecast[];
  timezone: string;
}

const formatDate = (timestamp: number, timezone: string) => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: timezone
  })
}

export default function WeekGraphs({daily, timezone}: WeekForecastProps) {
  const tempData = daily.map(day => {
    return {
      date: formatDate(day.dt, timezone),
      highTemp: Math.round(day.temp.max),
      lowTemp: Math.round(day.temp.min),
      dewPoint: Math.round(day.dew_point)
    };
  })

  const windData = daily.map(day => {
    return {
      date: formatDate(day.dt, timezone),
      windSpeed: Math.round(day.wind_speed),
      windGust: day.wind_gust != null ? Math.round(day.wind_gust) : null,
      windDirection: day.wind_deg
    }
  })

  const hasGustData = windData.some(day => day.windGust != null)

  const findWindMax = (dailyData: DailyForecast[]): number => {
    let windMax = 30; // Wind scale will be at least 30
    let currentWindValue;
    for (let i = 0; i < dailyData.length; i++) {
      const gust = dailyData[i].wind_gust
      currentWindValue = gust !== undefined ? gust: dailyData[i].wind_speed
      if (currentWindValue > windMax) {
        windMax = currentWindValue
      }
    }
    return Math.ceil(windMax / 10) * 10
  }

  const windMaxValue = findWindMax(daily)

  const createWindTickYArray = (windMax: number): number[]  => {
    const windTicksY = []
    for (let i = 0; i < (windMax / 10) + 1; i++) {
      windTicksY.push(i * 10)
    }
    return windTicksY
  }

  const windTicksY = createWindTickYArray(windMaxValue)

  return (
    <div className={"week-graphs"}>
      <h3 className={"daily-forecast-graph-title"}>Temperature and Dew Point</h3>
      <ResponsiveContainer className={"daily-forecast-graph"} width="100%" height={400}>
        <ComposedChart data={tempData} barCategoryGap={0}>
          <CartesianGrid strokeDasharray="3 3" stroke="#888"/>
          <XAxis dataKey="date"/>
          <YAxis
            label={{ value: '\u00B0F', angle: -90, position: 'insideLeft', offset: 10 }}
          />
          <Legend/>

          <Bar
            dataKey="lowTemp"
            fill="blue"
            name="Low Temp"
            barSize={40}
          />
          <Bar
            dataKey="highTemp"
            fill="red"
            name="High Temp"
            barSize={40}
          />
          <Line
            dataKey="dewPoint"
            type="monotone"
            stroke="green"
            strokeWidth={3}
            name="Dew Point"
            dot={{r: 8}}
          />
          <Tooltip/>
        </ComposedChart>
      </ResponsiveContainer>
      <h3 className={"daily-forecast-graph-title"}>Wind Speed and Gusts</h3>
      <ResponsiveContainer className={"daily-forecast-graph"} width="100%" height={400}>
        <LineChart data={windData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#888"/>
          <XAxis dataKey="date"/>
          <YAxis
            label={{ value: 'mph', angle: -90, position: 'insideLeft', offset: 10 }}
            domain={[0, windMaxValue]}
            ticks={windTicksY}
          />
          <Legend/>
          <Line
            dataKey="windSpeed"
            name="Wind Speed"
            stroke="#00f"
            strokeWidth={3}
          />
          {hasGustData && (
            <Line
              dataKey="windGust"
              name="Wind Gust"
              stroke="#88f"
              strokeWidth={3}
              strokeDasharray="3 3"
              connectNulls
            />
          )}
          <Tooltip/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}