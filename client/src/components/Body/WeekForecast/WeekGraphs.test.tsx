import {describe, it, expect, vi} from "vitest"
import {render, within} from "@testing-library/react"
import type {ReactNode} from "react"
import WeekGraphs from "./WeekGraphs"
import type {DailyForecast} from "../../../types/openweathermap"

// Recharts' ResponsiveContainer relies on ResizeObserver and real layout, neither of
// which jsdom provides, so real chart SVGs never render meaningful content in tests.
// Instead we stub the primitives WeekGraphs composes and assert on the props it
// passes them, which is where this component's own branching logic actually lives.
vi.mock("recharts", () => {
    const propsProbe = (testId: string) => (props: Record<string, unknown>) => (
        <div data-testid={testId} data-props={JSON.stringify(props)}/>
    )
    return {
        ResponsiveContainer: ({children}: {children: ReactNode}) => <div>{children}</div>,
        ComposedChart: ({data, children}: {data: unknown; children: ReactNode}) => (
            <div data-testid="composed-chart" data-props={JSON.stringify({data})}>{children}</div>
        ),
        LineChart: ({data, children}: {data: unknown; children: ReactNode}) => (
            <div data-testid="line-chart" data-props={JSON.stringify({data})}>{children}</div>
        ),
        Bar: propsProbe("bar"),
        Line: propsProbe("line"),
        XAxis: propsProbe("x-axis"),
        YAxis: propsProbe("y-axis"),
        CartesianGrid: propsProbe("cartesian-grid"),
        Tooltip: propsProbe("tooltip"),
        Legend: propsProbe("legend")
    }
})

const makeDay = (overrides: Partial<DailyForecast> = {}): DailyForecast => ({
    clouds: 40,
    dew_point: 50,
    dt: 1_700_000_000,
    feels_like: {day: 70, eve: 65, morn: 55, night: 60},
    humidity: 55,
    moon_phase: 0.5,
    moon_rise: 1_700_010_000,
    moon_set: 1_700_050_000,
    pop: 0.42,
    pressure: 1012,
    summary: "Partly cloudy",
    sunrise: 1_699_990_000,
    sunset: 1_700_030_000,
    temp: {day: 68, eve: 62, max: 72, min: 58, morn: 55, night: 60},
    uvi: 5,
    weather: [{description: "scattered clouds", icon: "03d", id: 802, main: "Clouds"}],
    wind_deg: 180,
    wind_speed: 10,
    ...overrides
})

const getProps = (el: HTMLElement) => JSON.parse(el.dataset.props ?? "{}")

describe("WeekGraphs", () => {
    it("passes one chart data point per forecast day to both charts", () => {
        const daily = [makeDay({dt: 1, wind_speed: 10}), makeDay({dt: 2, wind_speed: 15}), makeDay({dt: 3, wind_speed: 20})]
        const {getByTestId} = render(<WeekGraphs daily={daily} timezone="America/New_York"/>)

        expect(getProps(getByTestId("composed-chart")).data).toHaveLength(3)
        expect(getProps(getByTestId("line-chart")).data).toHaveLength(3)
    })

    it("keeps the wind axis at a 30mph floor when all days are calm", () => {
        const daily = [makeDay({wind_speed: 10}), makeDay({wind_speed: 15}), makeDay({wind_speed: 20})]
        const {getByTestId} = render(<WeekGraphs daily={daily} timezone="America/New_York"/>)

        const yAxis = within(getByTestId("line-chart")).getByTestId("y-axis")
        expect(getProps(yAxis).domain).toEqual([0, 30])
        expect(getProps(yAxis).ticks).toEqual([0, 10, 20, 30])
    })

    it("scales the wind axis up to the highest wind speed, rounded up to the next 10", () => {
        const daily = [makeDay({wind_speed: 10}), makeDay({wind_speed: 45})]
        const {getByTestId} = render(<WeekGraphs daily={daily} timezone="America/New_York"/>)

        const yAxis = within(getByTestId("line-chart")).getByTestId("y-axis")
        expect(getProps(yAxis).domain).toEqual([0, 50])
        expect(getProps(yAxis).ticks).toEqual([0, 10, 20, 30, 40, 50])
    })

    it("scales the wind axis using gust speed when it exceeds sustained wind", () => {
        const daily = [makeDay({wind_speed: 20, wind_gust: 63})]
        const {getByTestId} = render(<WeekGraphs daily={daily} timezone="America/New_York"/>)

        const yAxis = within(getByTestId("line-chart")).getByTestId("y-axis")
        expect(getProps(yAxis).domain).toEqual([0, 70])
    })

    it("omits the gust line when no day has gust data", () => {
        const daily = [makeDay({wind_speed: 10, wind_gust: undefined}), makeDay({wind_speed: 15, wind_gust: undefined})]
        const {getByTestId} = render(<WeekGraphs daily={daily} timezone="America/New_York"/>)

        const lines = within(getByTestId("line-chart")).getAllByTestId("line")
        expect(lines).toHaveLength(1)
        expect(getProps(lines[0]).dataKey).toBe("windSpeed")
    })

    it("renders a gust line alongside wind speed when at least one day has gust data", () => {
        const daily = [makeDay({wind_speed: 10, wind_gust: undefined}), makeDay({wind_speed: 15, wind_gust: 22})]
        const {getByTestId} = render(<WeekGraphs daily={daily} timezone="America/New_York"/>)

        const lines = within(getByTestId("line-chart")).getAllByTestId("line")
        const dataKeys = lines.map(line => getProps(line).dataKey)
        expect(dataKeys).toEqual(expect.arrayContaining(["windSpeed", "windGust"]))
    })
})
