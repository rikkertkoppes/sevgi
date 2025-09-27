import { LineSegment } from "@/Core/Geometry/Line";
import { Point, v2 } from "@/Core/Geometry/Vector";
import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";

export const line: PrimitiveFunction = {
    name: "line",
    label: "Line",
    description: "Creates a line",
    inputs: {
        start: { type: "Point", default: v2(0, 0) },
        end: { type: "Point", default: v2(10, 10) },
    },
    outputs: {
        line: "Line",
    },
    impl: async (inputs) => {
        return {
            line: binaryOnTree(
                inputs.start,
                inputs.end,
                (o: Point, e: Point) => {
                    return new LineSegment(o, e);
                },
                true
            ),
        };
    },
};
