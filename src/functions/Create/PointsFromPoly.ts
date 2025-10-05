import { PolyLine } from "@/Core/Geometry/PolyLine";
import { mapTree, PrimitiveFunction } from "@rkmodules/rules";

export const pointsFromPoly: PrimitiveFunction = {
    name: "pointsFromPoly",
    label: "Points from Curve",
    description: "Get the points of a Curve",
    inputs: {
        curve: "Curve",
    },
    outputs: {
        points: "Point",
    },
    impl: async (inputs) => {
        return {
            points: mapTree(inputs.curve || {}, (s: PolyLine) => s.getPoints()),
        };
    },
};
