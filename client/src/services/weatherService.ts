import axios from "axios";

// Empty string is intentional in deployed builds (same-origin API calls -
// see validateEnv.ts); the "|| ''" guards against the literal string
// "undefined" ending up in the request URL if this is ever truly undefined.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// The backend's worst case (3 attempts x 15s timeouts plus backoff) is ~51s;
// give up well before that so a hung request shows an error instead of an
// endless spinner. Axios reports a timeout as code "ECONNABORTED".
const REQUEST_TIMEOUT_MS = 30000;

const weatherService = async (location: string, signal?: AbortSignal) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/api/openweathermap`, {
            params: { location },
            signal,
            timeout: REQUEST_TIMEOUT_MS
        })
        if (import.meta.env.MODE === "development") {
            console.log(res.data)
        }
        return res.data
    } catch (err) {
        if (axios.isCancel(err)) {
            // Superseded by a newer request (see useWeather); not a user-facing error.
            throw {
                error_type: "canceled",
                message: "Request canceled"
            }
        }
        if (axios.isAxiosError(err)) {
            console.error(err)
            if (err.response) {
                if (err.response.status === 404) {
                    throw {
                        error_type: err.response.data?.detail?.error_type || "not found",
                        message: err.response.data?.detail?.message || "Location not found"
                    }
                } else {
                    throw {
                        error_type: "server error",
                        message: `Server Error: ${err.response.status}`
                    }
                }
            } else {
                // No response means network error or timeout
                if (err.code === "ECONNABORTED") {
                    throw {
                        error_type: "timeout",
                        message: "Weather service timed out. Please try again later."
                    }
                }
                throw {
                    error_type: "network error",
                    message: "Could not connect to weather service. Check your connection or try again later."
                }
            }
        } else {
            throw {
                error_type: "unexpected error",
                message: "An unexpected error occurred."
            }
        }
    }
}

export default weatherService;
