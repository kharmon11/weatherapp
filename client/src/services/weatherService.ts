import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const weatherService = async (location: string) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/api/openweathermap`, {params: {location}})
        if (import.meta.env.MODE === "development") {
            console.log(res.data)
        }
        return res.data
    } catch (err) {
        console.log(err)
        if (axios.isAxiosError(err)) {
            console.error(err.response)
            if (err.response) {
                if (err.response.status === 404)
                    throw {error_type: err.response.data.detail.error_type, message: err.response.data.detail.message}
            } else {
                throw {error_type: "server error", message: "Server error"};
            }
        } else {
            throw {error_type: "server error", message: "Error while retrieving weather data. Try again later."};
        }
    }
}

export default weatherService;