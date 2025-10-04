import { PolyLine } from "@/Core/Geometry/PolyLine";
import { mapTree, PrimitiveFunction } from "@rkmodules/rules";

export const pointsFromPoly: PrimitiveFunction = {
    name: "pointsFromPoly",
    label: "Points from Poly",
    description: "Get the points of a PolyLine",
    inputs: {
        shape: "PolyLine",
    },
    outputs: {
        points: "Point",
    },
    impl: async (inputs) => {
        return {
            points: mapTree(inputs.shape || {}, (s: PolyLine) => s.getPoints()),
        };
    },
};
