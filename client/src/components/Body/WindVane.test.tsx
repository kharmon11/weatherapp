import {describe, it, expect} from "vitest"
import {render} from "@testing-library/react"
import WindVane from "./WindVane"

const getArrowRotation = (container: HTMLElement) => {
    const arrow = container.querySelector(".wind-vane-arrow") as HTMLElement
    return arrow.style.transform
}

describe("WindVane", () => {
    it("points directly at the given wind direction on initial render", () => {
        const {container} = render(<WindVane windDirection={90}/>)

        expect(getArrowRotation(container)).toBe("rotate(90deg)")
    })

    it("takes the shorter rotation path when the direction changes", () => {
        const {container, rerender} = render(<WindVane windDirection={90}/>)

        rerender(<WindVane windDirection={350}/>)

        // Direct arithmetic (350 - 90 = 260deg) would spin the long way around;
        // the shortest path is -10deg (equivalent heading, 100deg of travel).
        expect(getArrowRotation(container)).toBe("rotate(-10deg)")
    })

    it("takes the shorter path when the new direction wraps backward through 0/360", () => {
        const {container, rerender} = render(<WindVane windDirection={350}/>)

        rerender(<WindVane windDirection={10}/>)

        // Naive arithmetic (10 - 350 = -340deg) would spin almost a full circle
        // backward; the shortest path is +20deg forward (370deg is visually
        // identical to 10deg, but reached via a small nudge, not a near-full spin).
        expect(getArrowRotation(container)).toBe("rotate(370deg)")
    })
})
