import { PolyLine } from "@/Core/Geometry/PolyLine";
import { Point, v2 } from "@/Core/Geometry/Vector";
import { mapTreeBranch, PrimitiveFunction } from "@rkmodules/rules";

export const polyFromPoints: PrimitiveFunction = {
    name: "polyFromPoints",
    label: "Poly from points",
    description: "Creates a polyline from given points",
    inputs: {
        points: { type: "Point", default: v2(0, 0) },
    },
    params: {
        close: "boolean",
    },
    outputs: {
        shape: "PolyLine",
    },
    impl: async (inputs, params) => {
        const shape = mapTreeBranch(inputs.points, (pts: Point[]) => {
            const poly = PolyLine.fromPoints(pts, params.close);
            return [poly];
        });

        return {
            shape,
        };
    },
};
