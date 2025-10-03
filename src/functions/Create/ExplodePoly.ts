import { PolyLine } from "@/Core/Geometry/PolyLine";
import { mapTree, PrimitiveFunction } from "@rkmodules/rules";

export const expolodePoly: PrimitiveFunction = {
    name: "expolodePoly",
    label: "Explode Poly",
    description: "Explode a PolyLine into its segments",
    inputs: {
        shape: "PolyLine",
    },
    outputs: {
        segments: "Curve",
    },
    impl: async (inputs) => {
        return {
            segments: mapTree(inputs.shape, (s: PolyLine) => s.getSegments()),
        };
    },
};
