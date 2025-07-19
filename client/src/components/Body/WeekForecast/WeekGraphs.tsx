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

  return (
    <div className={"week-graphs"}>
      <h3 className={"daily-forecast-graph-title"}>Temperature and Dew Point</h3>
      <ResponsiveContainer className={"daily-forecast-graph"} width="100%" height={400}>
        <ComposedChart data={tempData} barCategoryGap={0}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="date"/>
          <YAxis
            label={{ value: '\u00B0F', angle: -90, position: 'insideLeft', offset: 10 }}
          />
          <Tooltip/>
          <Legend/>

          <Bar
            dataKey={"lowTemp"}
            fill={"blue"}
            name={"Low Temp"}
            barSize={40}
          />
          <Bar
            dataKey={"highTemp"}
            fill={"red"}
            name={"High Temp"}
            barSize={40}
          />
          <Line
            dataKey={"dewPoint"}
            type={"monotone"}
            stroke={"green"}
            strokeWidth={3}
            name={"Dew Point"}
            dot={{r: 8}}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <h3 className={"daily-forecast-graph-title"}>Wind Speed and Gusts</h3>
      <ResponsiveContainer className={"daily-forecast-graph"} width="100%" height={400}>
        <LineChart data={windData}>
          <XAxis dataKey="date"/>
          <YAxis
            label={{ value: 'mph', angle: -90, position: 'insideLeft', offset: 10 }}
          />
          <Tooltip/>
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
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}