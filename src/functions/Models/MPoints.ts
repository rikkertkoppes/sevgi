import { PolyLine } from "@/Core/Geometry/PolyLine";
import { mapTree, PrimitiveFunction } from "@rkmodules/rules";

export const mPoints: PrimitiveFunction = {
    name: "mPoints",
    label: "PolyLine Points",
    description: "Find points in a PolyLine",
    inputs: {
        shape: "PolyLine",
    },
    outputs: {
        points: "Point",
    },
    impl: async (inputs) => {
        return {
            points: mapTree(inputs.shape, (s: PolyLine) => s.getPoints()),
        };
    },
};
