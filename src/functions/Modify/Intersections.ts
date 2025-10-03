import { Segment } from "@/Core/Geometry/Segment";
import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";

export const intersections: PrimitiveFunction = {
    name: "intersections",
    label: "Intersections",
    description: "Intersections of two segments",
    inputs: {
        segment1: "Segment",
        segment2: "Segment",
    },
    outputs: {
        point: "Point",
    },
    impl: async (inputs) => {
        return {
            point: binaryOnTree(
                inputs.segment1 || {},
                inputs.segment2 || {},
                (c1: Segment, c2: Segment) => {
                    if (!c1 || !c2) return [];
                    const result = c1?.intersectWith(c2);
                    console.log(result);
                    return result || [];
                },
                true
            ),
        };
    },
};
