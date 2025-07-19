import {BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip} from 'recharts'

import roundToDecimal from "../../utils/roundToDecimal.ts";
import mmInchConvert from "../../utils/mmInchConvert.ts";
import type {MinutelyForecast} from "../../types/openweathermap.ts";

interface MinutelyChartProps {
    minutes: MinutelyForecast[];
    timezone: string;
    rainSnow: string;
}

export default function MinutelyChart({minutes, timezone}: MinutelyChartProps) {

    const chartData = minutes.map((minute, index) => {
        const date = new Date(minute.dt * 1000);
        const timeString = date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: timezone
        });
        const precip = roundToDecimal(mmInchConvert(minute.precipitation), 3)
        return {time: timeString, minute: index === 0? "now": `${index}min`, precip: precip}
    })

    const maxPrecip = roundToDecimal(Math.max(...chartData.map(minute => minute.precip)), 1, "ceil");
    let dataMax;
    if (maxPrecip > 1) {
        dataMax = maxPrecip
    } else if (maxPrecip > 0.5 && maxPrecip >= 1) {
        dataMax = 1
    } else  {
        dataMax = 0.5
    }

    return (
        <ResponsiveContainer>
            <BarChart data={chartData}>
                <XAxis dataKey={"minute"} tick={{fontSize: 10}} interval={9}/>
                <YAxis
                    tick={{fontSize: 12}}
                    domain={[0, dataMax]}
                    label={{
                        value: "in/hr",
                        angle: -90,
                        position: "insideLeft",
                        style: {textAnchor: "middle"}
                    }}
                />
                <Tooltip formatter={(val: number) => `${val} in`}/>
                <Bar dataKey={"precip"} fill={"#39f"}/>
            </BarChart>
        </ResponsiveContainer>
    )
}