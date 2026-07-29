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

    it("falls back to rounding for an unrecognized type", () => {
        expect(roundToDecimal(3.14159, 2, "bogus")).toBe(3.14)
    })
})
