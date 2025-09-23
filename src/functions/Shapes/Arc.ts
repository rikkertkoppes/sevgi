import { nAryOnTree, PrimitiveFunction } from "@rkmodules/rules";

import { paths } from "makerjs";

export const arc: PrimitiveFunction = {
    name: "arc",
    label: "Arc",
    description: "Creates a arc",
    inputs: {
        center: { type: "Point", default: [[0, 0]] },
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
                    return new paths.Arc(o, r, s, e);
                },
                true
            ),
        };
    },
};
