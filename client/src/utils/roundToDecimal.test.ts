import {describe, it, expect} from "vitest"
import roundToDecimal from "./roundToDecimal"

describe("roundToDecimal", () => {
    it("rounds to the nearest value at the given precision by default", () => {
        expect(roundToDecimal(3.14159, 2)).toBe(3.14)
    })

    it("floors when type is 'floor'", () => {
        expect(roundToDecimal(3.149, 2, "floor")).toBe(3.14)
    })

    it("ceils when type is 'ceil'", () => {
        expect(roundToDecimal(3.141, 2, "ceil")).toBe(3.15)
    })

    it("leaves an already-exact value unchanged when type is 'ceil'", () => {
        // Naively adding Number.EPSILON before Math.ceil (as "round"/"floor" do)
        // pushes an exact value like 1.0 just over its own boundary, bumping the
        // result to the next increment (1.1) instead of leaving it at 1.
        expect(roundToDecimal(1, 1, "ceil")).toBe(1)
        expect(roundToDecimal(0.5, 1, "ceil")).toBe(0.5)
    })

    it("falls back to rounding for an unrecognized type", () => {
        expect(roundToDecimal(3.14159, 2, "bogus")).toBe(3.14)
    })
})
