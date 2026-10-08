import {describe, it, expect, vi, beforeEach} from "vitest"
import {render, screen} from "@testing-library/react"
import {useEffect} from "react"
import GoogleMap from "./GoogleMap"

// The real Maps API can't load in jsdom, so the library is replaced with
// stand-ins. What matters here is GoogleMap's own behavior: it must keep the
// same <Map> instance when the location changes and move it with panTo.
const lib = vi.hoisted(() => {
    const panTo = vi.fn()
    return {
        panTo,
        map: {panTo}, // stable instance, like the real useMap()
        mapMounts: {count: 0},
        mapProps: {} as Record<string, unknown>
    }
})

vi.mock("@vis.gl/react-google-maps", () => ({
    APIProvider: ({children}: { children: React.ReactNode }) => <div data-testid="api-provider">{children}</div>,
    Map: (props: Record<string, unknown> & { children: React.ReactNode }) => {
        useEffect(() => {
            lib.mapMounts.count++
        }, [])
        lib.mapProps = props
        return <div data-testid="map">{props.children}</div>
    },
    AdvancedMarker: (props: { position: { lat: number, lng: number } }) => (
        <div data-testid="marker" data-position={JSON.stringify(props.position)}/>
    ),
    useMap: () => lib.map
}))

describe("GoogleMap", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        lib.mapMounts.count = 0
    })

    it("centers the map and marker on the given location", () => {
        render(<GoogleMap lat={42.36} lon={-71.06} handleMapClick={vi.fn()}/>)

        expect(lib.mapProps.defaultCenter).toEqual({lat: 42.36, lng: -71.06})
        expect(lib.mapProps.defaultZoom).toBe(10)
        expect(JSON.parse(screen.getByTestId("marker").dataset.position!)).toEqual({lat: 42.36, lng: -71.06})
    })

    it("passes the click handler to the map", () => {
        const handleMapClick = vi.fn()
        render(<GoogleMap lat={1} lon={2} handleMapClick={handleMapClick}/>)

        expect(lib.mapProps.onClick).toBe(handleMapClick)
    })

    it("pans the existing map to a new location without recreating it", () => {
        const {rerender} = render(<GoogleMap lat={42.36} lon={-71.06} handleMapClick={vi.fn()}/>)
        lib.panTo.mockClear()

        rerender(<GoogleMap lat={39.74} lon={-104.99} handleMapClick={vi.fn()}/>)

        expect(lib.panTo).toHaveBeenCalledExactlyOnceWith({lat: 39.74, lng: -104.99})
        expect(lib.mapMounts.count).toBe(1) // same Map instance: never remounted
        expect(JSON.parse(screen.getByTestId("marker").dataset.position!)).toEqual({lat: 39.74, lng: -104.99})
    })

    it("does not pan again when re-rendered with the same location", () => {
        const {rerender} = render(<GoogleMap lat={42.36} lon={-71.06} handleMapClick={vi.fn()}/>)
        lib.panTo.mockClear()

        rerender(<GoogleMap lat={42.36} lon={-71.06} handleMapClick={vi.fn()}/>)

        expect(lib.panTo).not.toHaveBeenCalled()
    })
})
