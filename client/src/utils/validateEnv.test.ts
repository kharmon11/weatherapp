import {describe, it, expect, beforeEach, afterEach, vi} from "vitest"
import {validateRequiredEnvVars} from "./validateEnv"

describe("validateRequiredEnvVars", () => {
    beforeEach(() => {
        vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8000")
        vi.stubEnv("VITE_GOOGLE_MAPS_JAVASCRIPT_KEY", "test-key")
        vi.stubEnv("VITE_GOOGLE_MAPS_MAP_ID", "test-map-id")
        vi.spyOn(console, "error").mockImplementation(() => {})
    })

    afterEach(() => {
        vi.unstubAllEnvs()
    })

    it("does not throw when all required vars are present", () => {
        expect(() => validateRequiredEnvVars()).not.toThrow()
    })

    it("throws naming the missing variable", () => {
        vi.stubEnv("VITE_GOOGLE_MAPS_MAP_ID", "")

        expect(() => validateRequiredEnvVars()).toThrow(
            "Missing environment variable: VITE_GOOGLE_MAPS_MAP_ID"
        )
    })
})
