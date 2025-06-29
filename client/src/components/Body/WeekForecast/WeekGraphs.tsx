import "./WeekGraphs.sass"
import {ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from "recharts";
import type {DailyForecast} from "../../../types/openweathermap";

interface WeekForecastProps {
    daily: DailyForecast[];
    timezone: string;
}

export default function WeekGraphs({daily, timezone}: WeekForecastProps) {
    return (
        <div className={"week-graphs"}>

        </div>
    )
}