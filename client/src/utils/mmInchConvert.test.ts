import {describe, it, expect} from "vitest"
import mmInchConvert from "./mmInchConvert"

describe("mmInchConvert", () => {
    it("converts millimeters to inches by default", () => {
        expect(mmInchConvert(25.4)).toBeCloseTo(1, 5)
    })

    it("converts inches to millimeters when reverse is true", () => {
        expect(mmInchConvert(1, true)).toBeCloseTo(25.4, 5)
    })

    it("returns 0 for a 0 input in either direction", () => {
        expect(mmInchConvert(0)).toBe(0)
        expect(mmInchConvert(0, true)).toBe(0)
    })
})
