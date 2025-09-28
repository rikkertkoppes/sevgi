import { Curve } from "@/Core/Geometry/Curve";
import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";

export const evaluateCurve: PrimitiveFunction = {
    name: "evaluateCurve",
    label: "Evaluate Curve",
    description: "Evaluate a curve at a given parameter t",
    inputs: {
        curve: "Curve",
        t: { type: "number", default: 0.5 },
    },
    outputs: {
        point: "Point",
        normal: "Point",
        tangent: "Point",
    },
    impl: async (inputs) => {
        return {
            point: binaryOnTree(
                inputs.curve || {},
                inputs.t,
                (c: Curve, t: number) => {
                    return c?.pointAt(t);
                },
                true
            ),
            normal: binaryOnTree(
                inputs.curve || {},
                inputs.t,
                (c: Curve, t: number) => {
                    return c?.normalAt(t);
                },
                true
            ),
            tangent: binaryOnTree(
                inputs.curve || {},
                inputs.t,
                (c: Curve, t: number) => {
                    return c?.tangentAt(t);
                },
                true
            ),
        };
    },
};
