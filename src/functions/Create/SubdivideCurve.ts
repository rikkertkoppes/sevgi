import { Curve } from "@/Core/Geometry/Curve";
import {
    graftTree,
    mapTree,
    PrimitiveFunction,
    trimTree,
} from "@rkmodules/rules";

export const subdivideCurve: PrimitiveFunction = {
    name: "subdivideCurve",
    label: "Subdivide Curve",
    description: "Subdivide a curve into n points",
    inputs: {
        curve: "Curve",
    },
    params: {
        n: { type: "number", default: 3, min: 1, step: 1 },
        merge: { type: "boolean", default: false, label: "merge" },
    },
    outputs: {
        points: "Point",
    },
    impl: async (inputs, params) => {
        const curve = graftTree(inputs.curve || {});
        let points = mapTree(curve || {}, (s: Curve) => {
            const n = s.isClosed ? params.n + 1 : params.n;
            if (n < 2) return [s.pointAt(0)];
            const ts = Array.from({ length: params.n }, (_, i) => i / (n - 1));
            return ts.map((t) => s.pointAt(t));
        });
        if (params.merge) {
            points = trimTree(points);
        }
        return {
            points,
        };
    },
};
