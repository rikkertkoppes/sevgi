export const TAU = 2 * Math.PI;

/**
 * brings an angle in the range [0, 2π)
 * @param angle
 */
export function normalizeAngle(angle: number) {
    return ((angle % TAU) + TAU) % TAU;
}
export function toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}
export function toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
}

export function fixedNum(
    [first, ...rest]: TemplateStringsArray,
    ...values: any
) {
    let result = first;
    rest.forEach((string, i) => {
        const value = values[i];
        if (typeof value === "number") {
            let v = value.toFixed(3);
            if (v === "-0.000") {
                v = "0.000";
            }
            result += v;
        } else {
            result += value;
        }
        result += string;
    });
    return result;
}
