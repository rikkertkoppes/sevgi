import { Curve } from "@/Core/Geometry/Curve";
import { binaryOnTree, DISCARD, PrimitiveFunction } from "@rkmodules/rules";

export const evaluateCurve: PrimitiveFunction = {
    name: "evaluateCurve",
    label: "Evaluate Curve",
    description: "Evaluate a curve at a given parameter t",
    inputs: {
        curve: "Curve",
        t: { type: "number", default: 0.5, min: 0, max: 1, step: 0.01 },
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
                (c?: Curve, t = 0.5) => {
                    return c?.pointAt(t) || DISCARD;
                },
                true
            ),
            normal: binaryOnTree(
                inputs.curve || {},
                inputs.t,
                (c?: Curve, t = 0.5) => {
                    return c?.normalAt(t) || DISCARD;
                },
                true
            ),
            tangent: binaryOnTree(
                inputs.curve || {},
                inputs.t,
                (c?: Curve, t = 0.5) => {
                    return c?.tangentAt(t) || DISCARD;
                },
                true
            ),
        };
    },
};
