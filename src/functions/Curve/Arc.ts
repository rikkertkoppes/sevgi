import { Arc } from "@/Core/Geometry/Arc";
import { Circle } from "@/Core/Geometry/Circle";
import { toRadians } from "@/Core/Geometry/Util";
import { v2 } from "@/Core/Geometry/Vector";
import { nAryOnTree, PrimitiveFunction } from "@rkmodules/rules";

export const arc: PrimitiveFunction = {
    name: "arc",
    label: "Arc",
    description: "Creates a arc",
    inputs: {
        center: { type: "Point", default: v2(0, 0) },
        radius: { type: "number", default: 10 },
        start: { type: "number", default: 0 },
        end: { type: "number", default: 90 },
    },
    outputs: {
        path: "Arc",
    },
    impl: async (inputs) => {
        return {
            path: nAryOnTree(
                [inputs.center, inputs.radius, inputs.start, inputs.end],
                ([o, r, s, e]) => {
                    const c = new Circle(o, r);
                    return new Arc(c, toRadians(s), toRadians(e));
                },
                true
            ),
        };
    },
};
