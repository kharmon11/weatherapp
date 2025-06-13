export default function cloudinessText(clouds: number) {
    if (clouds < 12) {
        return "Clear"
    } else if (clouds >= 12 && clouds < 25) {
        return "Mostly Sunny"
    } else if (clouds >= 25 && clouds < 50) {
        return "Scattered Clouds"
    } else if (clouds >= 50 && clouds < 87) {
        return "Mostly Cloudy"
    } else {
        return "Overcast"
    }
}