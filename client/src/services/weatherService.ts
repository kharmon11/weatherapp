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
                    alert("Geocoding error. Try a different location name.")
            } else {
                alert("Server error. Try again later.")
            }
        } else {
            alert("Error occurred while retrieving weather data. Try again later.")
        }
    }
}

export default weatherService;