import { PolyLine } from "@/Core/Geometry/PolyLine";
import {
    graftTree,
    mapTree,
    PrimitiveFunction,
    trimTree,
} from "@rkmodules/rules";

export const pointsFromPoly: PrimitiveFunction = {
    name: "pointsFromPoly",
    label: "Points from Curve",
    description: "Get the points of a Curve",
    inputs: {
        curve: "Curve",
    },
    params: {
        merge: { type: "boolean", default: false, label: "merge" },
    },
    outputs: {
        points: "Point",
    },
    impl: async (inputs, params) => {
        const curve = graftTree(inputs.curve || {});
        let points = mapTree(curve || {}, (s: PolyLine) => s.getPoints());
        if (params.merge) {
            points = trimTree(points);
        }
        return {
            points,
        };
    },
};
