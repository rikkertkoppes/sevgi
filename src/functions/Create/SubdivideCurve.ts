import { Curve } from "@/Core/Geometry/Curve";
import { mapTree, PrimitiveFunction } from "@rkmodules/rules";

export const subdivideCurve: PrimitiveFunction = {
    name: "subdivideCurve",
    label: "Subdivide Curve",
    description: "Subdivide a curve into n points",
    inputs: {
        curve: "Curve",
    },
    params: {
        n: { type: "number", default: 3 },
    },
    outputs: {
        points: "Point",
    },
    impl: async (inputs, params) => {
        return {
            points: mapTree(inputs.curve || {}, (s: Curve) => {
                const ts = Array.from(
                    { length: params.n },
                    (_, i) => i / (params.n - 1)
                );
                console.log(ts);
                return ts.map((t) => s.pointAt(t));
            }),
        };
    },
};
