import {describe, it, expect, vi} from "vitest"
import {render, screen} from "@testing-library/react"
import Current from "./Current"
import type {CurrentWeather, MinutelyForecast} from "../../types/openweathermap"

// GoogleMap and MinutelyChart pull in @vis.gl/react-google-maps and recharts
// respectively, neither of which render anything meaningful in jsdom (no real
// Maps API, no ResizeObserver). We stub both and assert on the props Current
// passes them, which is where Current's own branching logic actually lives.
vi.mock("./GoogleMap.tsx", () => ({
    default: (props: Record<string, unknown>) => (
        <div data-testid="google-map-mock" data-props={JSON.stringify(props)}/>
    )
}))
vi.mock("./MinutelyChart.tsx", () => ({
    default: (props: Record<string, unknown>) => (
        <div data-testid="minutely-chart-mock" data-props={JSON.stringify(props)}/>
    )
}))

const getProps = (el: HTMLElement) => JSON.parse(el.dataset.props ?? "{}")

const makeCurrent = (overrides: Partial<CurrentWeather> = {}): CurrentWeather => ({
    dt: 1_700_000_000,
    sunrise: 1_699_990_000,
    sunset: 1_700_030_000,
    temp: 68.4,
    feels_like: 65.2,
    pressure: 1012,
    humidity: 55,
    dew_point: 50.4,
    uvi: 5,
    clouds: 40,
    visibility: 10000,
    wind_speed: 12.4,
    wind_deg: 180,
    weather: [{description: "scattered clouds", icon: "03d", id: 802, main: "Clouds"}],
    ...overrides
})

const baseProps = {
    minutely: [] as MinutelyForecast[],
    timezone: "America/New_York",
    location_text: "Boston, MA",
    lat: 42.35,
    lon: -71.06,
    lat_string: "42.35 °N",
    lon_string: "-71.06 °E",
    handleMapClick: vi.fn(),
    googleMapError: false
}

describe("Current", () => {
    it("renders temp, feels-like, dew point, and humidity", () => {
        const {container} = render(<Current current={makeCurrent()} {...baseProps}/>)

        expect(container.querySelector(".temp-display")?.textContent).toBe("68°")
        expect(container.querySelector(".feels-like-display")?.textContent).toBe("FEELS 65°")
        expect(container.querySelector(".current-humidity")?.textContent).toBe("Dew Point: 50°FHumidity: 55%")
    })

    it("shows the wind gust when present", () => {
        const {container} = render(<Current current={makeCurrent({wind_gust: 18.6})} {...baseProps}/>)

        expect(container.querySelector(".current-wind-speeds")?.textContent).toBe("Speed: 12mphGusts: 19mph")
    })

    it("omits the gust display when wind_gust is undefined", () => {
        const {container} = render(<Current current={makeCurrent({wind_gust: undefined})} {...baseProps}/>)

        expect(container.querySelector(".current-wind-speeds")?.textContent).toBe("Speed: 12mph")
    })

    it("hides the precip panel when there is no minutely data", () => {
        const {container} = render(<Current current={makeCurrent()} {...baseProps} minutely={[]}/>)

        expect(container.querySelector(".current-precip")).not.toBeInTheDocument()
        expect(screen.queryByTestId("minutely-chart-mock")).not.toBeInTheDocument()
    })

    it("hides the precip panel when minutely data has zero precipitation throughout", () => {
        const minutely = [{dt: 1, precipitation: 0}, {dt: 2, precipitation: 0}]
        const {container} = render(<Current current={makeCurrent()} {...baseProps} minutely={minutely}/>)

        expect(container.querySelector(".current-precip")).not.toBeInTheDocument()
    })

    it("shows the precip panel and MinutelyChart when any minute has precipitation", () => {
        const minutely = [{dt: 1, precipitation: 0}, {dt: 2, precipitation: 0.5}]
        const {container} = render(<Current current={makeCurrent()} {...baseProps} minutely={minutely}/>)

        expect(container.querySelector(".current-precip")).toBeInTheDocument()
        expect(screen.getByTestId("minutely-chart-mock")).toBeInTheDocument()
    })

    it("passes the rain/snow classification derived from the weather description to MinutelyChart", () => {
        const minutely = [{dt: 1, precipitation: 0.5}]
        const current = makeCurrent({weather: [{description: "Light Snow", icon: "13d", id: 601, main: "Snow"}]})
        render(<Current current={current} {...baseProps} minutely={minutely}/>)

        expect(getProps(screen.getByTestId("minutely-chart-mock")).rainSnow).toBe("snow")
    })

    it("shows a rain rate line when current.rain is present", () => {
        const minutely = [{dt: 1, precipitation: 0.5}]
        const current = makeCurrent({rain: {"1h": 25.4}})
        const {container} = render(<Current current={current} {...baseProps} minutely={minutely}/>)

        expect(container.querySelector(".current-rain")?.textContent).toBe("Rain: 1in/hr")
        expect(container.querySelector(".current-snow")).not.toBeInTheDocument()
    })

    it("shows a snow rate line when current.snow is present", () => {
        const minutely = [{dt: 1, precipitation: 0.5}]
        const current = makeCurrent({snow: {"1h": 12.7}})
        const {container} = render(<Current current={current} {...baseProps} minutely={minutely}/>)

        expect(container.querySelector(".current-snow")?.textContent).toBe("Snow: 0.5in/hr")
        expect(container.querySelector(".current-rain")).not.toBeInTheDocument()
    })

    it("shows the coordinates and toggles the map error message", () => {
        const {container, rerender} = render(<Current current={makeCurrent()} {...baseProps}/>)

        expect(container.querySelector(".coordinates")?.textContent).toBe("lat: 42.35 °N, lon: -71.06 °E")
        expect(container.querySelector(".google-map-error")?.className).not.toContain("visible")

        rerender(<Current current={makeCurrent()} {...baseProps} googleMapError={true}/>)
        expect(container.querySelector(".google-map-error")?.className).toContain("visible")
    })
})
