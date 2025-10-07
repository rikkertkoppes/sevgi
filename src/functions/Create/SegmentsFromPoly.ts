import { PolyLine } from "@/Core/Geometry/PolyLine";
import {
    graftTree,
    mapTree,
    PrimitiveFunction,
    trimTree,
} from "@rkmodules/rules";

export const segmentsFromPoly: PrimitiveFunction = {
    name: "segmentsFromPoly",
    label: "Segments from Poly",
    description: "Get the segments of a PolyLine",
    inputs: {
        shape: "PolyLine",
    },
    params: {
        merge: { type: "boolean", default: false, label: "merge" },
    },
    outputs: {
        segments: "Curve",
    },
    impl: async (inputs, params) => {
        const shape = graftTree(inputs.shape || {});
        let segments = mapTree(shape, (s: PolyLine) => s.getSegments());
        if (params.merge) {
            segments = trimTree(segments);
        }
        return {
            segments,
        };
    },
};
