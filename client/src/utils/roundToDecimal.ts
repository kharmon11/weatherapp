export default function roundToDecimal(num: number, decimals: number, type: string="round") {
    const factor = Math.pow(10, decimals);
    switch (type) {
        case "round":
            return Math.round((num + Number.EPSILON) * factor) / factor;
        case "floor":
            return Math.floor((num + Number.EPSILON) * factor) / factor;
        case "ceil":
            return Math.ceil((num + Number.EPSILON) * factor) / factor;
        default:
            return Math.round((num + Number.EPSILON) * factor) / factor;
    }
}