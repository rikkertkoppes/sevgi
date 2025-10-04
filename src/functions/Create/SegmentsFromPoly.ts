import { PolyLine } from "@/Core/Geometry/PolyLine";
import { mapTree, PrimitiveFunction } from "@rkmodules/rules";

export const segmentsFromPoly: PrimitiveFunction = {
    name: "segmentsFromPoly",
    label: "Segments from Poly",
    description: "Get the segments of a PolyLine",
    inputs: {
        shape: "PolyLine",
    },
    outputs: {
        segments: "Curve",
    },
    impl: async (inputs) => {
        return {
            segments: mapTree(inputs.shape || {}, (s: PolyLine) =>
                s.getSegments()
            ),
        };
    },
};
