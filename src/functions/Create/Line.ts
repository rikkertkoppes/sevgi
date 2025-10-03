import { Arc } from "@/Core/Geometry/Arc";
import { LineSegment } from "@/Core/Geometry/LineSegment";
import { v2 } from "@/Core/Geometry/Vector";
import { nAryOnTree, PrimitiveFunction } from "@rkmodules/rules";

export const line: PrimitiveFunction = {
    name: "line",
    label: "Line",
    description: "Creates a line",
    inputs: {
        start: { type: "Point", default: v2(0, 0) },
        end: { type: "Point", default: v2(10, 10) },
        bulge: { type: "number", default: 0 },
    },
    outputs: {
        line: "Line",
    },
    impl: async (inputs) => {
        return {
            line: nAryOnTree(
                [inputs.start, inputs.end, inputs.bulge],
                ([o, e, s]) => {
                    if (s !== 0) {
                        return Arc.fromPoints(o, e, s);
                    } else {
                        return new LineSegment(o, e);
                    }
                },
                true
            ),
        };
    },
};
