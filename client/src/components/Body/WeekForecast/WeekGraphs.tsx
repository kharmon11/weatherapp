import "./WeekGraphs.sass"
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    ComposedChart,
    Line,
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

    return (
        <div className={"week-graphs"}>
            <ResponsiveContainer className={"daily-forecast-graph"} width="100%" height={400}>
                <ComposedChart data={tempData} barCategoryGap={0}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="date"/>
                    <YAxis/>
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
        </div>
    )
}