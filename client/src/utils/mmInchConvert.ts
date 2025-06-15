// Convert a millimeter value to inches. Set "reverse" to true to convert an inch value to millimeters
export default function mmInchConvert(mmValue: number, reverse: boolean = false) {
    return reverse? mmValue / 0.039370078740157: mmValue * 0.039370078740157
}