import {describe, it, expect} from "vitest"
import {render} from "@testing-library/react"
import type {ReactNode} from "react"
import {vi} from "vitest"
import MinutelyChart from "./MinutelyChart"
import type {MinutelyForecast} from "../../types/openweathermap"

// Recharts' ResponsiveContainer relies on ResizeObserver and real layout, neither of
// which jsdom provides. We stub the primitives MinutelyChart composes and assert on
// the props it passes them, mirroring the approach in WeekGraphs.test.tsx.
vi.mock("recharts", () => {
    const propsProbe = (testId: string) => (props: Record<string, unknown>) => (
        <div data-testid={testId} data-props={JSON.stringify(props)}/>
    )
    return {
        ResponsiveContainer: ({children}: {children: ReactNode}) => <div>{children}</div>,
        BarChart: ({data, children}: {data: unknown; children: ReactNode}) => (
            <div data-testid="bar-chart" data-props={JSON.stringify({data})}>{children}</div>
        ),
        Bar: propsProbe("bar"),
        XAxis: propsProbe("x-axis"),
        YAxis: propsProbe("y-axis"),
        Tooltip: propsProbe("tooltip")
    }
})

const getProps = (el: HTMLElement) => JSON.parse(el.dataset.props ?? "{}")

const makeMinutes = (precipValues: number[]): MinutelyForecast[] =>
    precipValues.map((precipitation, index) => ({dt: 1_700_000_000 + index * 60, precipitation}))

describe("MinutelyChart", () => {
    it("builds one chart data point per minute, labeling the first as 'now'", () => {
        const minutes = makeMinutes([0, 0.5, 1])
        const {getByTestId} = render(<MinutelyChart minutes={minutes} timezone="America/New_York" rainSnow="rain"/>)

        const data = getProps(getByTestId("bar-chart")).data
        expect(data).toHaveLength(3)
        expect(data[0].minute).toBe("now")
        expect(data[1].minute).toBe("1min")
        expect(data[2].minute).toBe("2min")
    })

    it("converts precipitation from mm to inches, rounded to 3 decimals", () => {
        const minutes = makeMinutes([25.4]) // exactly 1 inch
        const {getByTestId} = render(<MinutelyChart minutes={minutes} timezone="America/New_York" rainSnow="rain"/>)

        expect(getProps(getByTestId("bar-chart")).data[0].precip).toBe(1)
    })

    it("floors the y-axis domain at 0.5 when precipitation is low", () => {
        const minutes = makeMinutes([0, 0.1])
        const {getByTestId} = render(<MinutelyChart minutes={minutes} timezone="America/New_York" rainSnow="rain"/>)

        expect(getProps(getByTestId("y-axis")).domain).toEqual([0, 0.5])
    })

    it("keeps the y-axis domain at exactly 1 when peak precipitation rounds to 1.0", () => {
        const minutes = makeMinutes([25.4]) // 1.000in, ceil-rounded to 1 decimal is exactly 1.0
        const {getByTestId} = render(<MinutelyChart minutes={minutes} timezone="America/New_York" rainSnow="rain"/>)

        expect(getProps(getByTestId("y-axis")).domain).toEqual([0, 1])
    })

    it("scales the y-axis domain up to the rounded-up peak when precipitation exceeds 1in/hr", () => {
        const minutes = makeMinutes([30]) // ~1.181in, ceil-rounded to 1 decimal is 1.2
        const {getByTestId} = render(<MinutelyChart minutes={minutes} timezone="America/New_York" rainSnow="rain"/>)

        expect(getProps(getByTestId("y-axis")).domain).toEqual([0, 1.2])
    })
})
