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

export function uid() {
    return Math.random().toString(36).substring(2, 15);
}

// fast hashing
// Quantize to 3 decimals, return a 32-bit signed int
function q3(x: number): number {
    // Using Math.round is usually what people intend for fixed decimals
    // normalize -0 to 0 to keep keys stable
    const q = Math.round(x * 1000);
    return q === 0 ? 0 : q | 0;
}

export function hashNumbers(...nums: number[]) {
    let h = BigInt(0);
    for (let i = 0; i < nums.length; i++) {
        const x = BigInt(q3(nums[i]) >>> 0); // convert to unsigned bigint, at 3 decimals precision
        h = (h << BigInt(32)) | x; // shift left and add
    }
    return h;
}
