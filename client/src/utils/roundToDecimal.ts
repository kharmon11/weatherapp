export default function roundToDecimal(num: number, decimals: number, type: string="round") {
    const factor = Math.pow(10, decimals);
    switch (type) {
        case "round":
            return Math.round((num + Number.EPSILON) * factor) / factor;
        case "floor":
            return Math.floor((num + Number.EPSILON) * factor) / factor;
        case "ceil":
            // Subtract here, where round/floor add: all three exist to cancel
            // floating-point noise from the caller's upstream arithmetic, but
            // ceil rounds up on ANY excess, so adding epsilon to an
            // already-exact value (e.g. 1.0) would push it to the next
            // increment (1.1) instead of leaving it unchanged.
            return Math.ceil((num - Number.EPSILON) * factor) / factor;
        default:
            return Math.round((num + Number.EPSILON) * factor) / factor;
    }
}