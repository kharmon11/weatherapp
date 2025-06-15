export default function rainOrSnow(description: string) {
    if (description.includes("rain")) {
        return "rain"
    } else if (description.includes("snow")) {
        return "snow"
    } else {
        return "none"
    }
}