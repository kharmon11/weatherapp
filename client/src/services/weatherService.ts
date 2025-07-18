import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const weatherService = async (location: string) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/api/openweathermap`, { params: { location } })
        if (import.meta.env.MODE === "development") {
            console.log(res.data)
        }
        return res.data
    } catch (err) {
        console.log(err)
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
