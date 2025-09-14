import { nAryOnTree, PrimitiveFunction } from "@rkmodules/rules";

import { paths } from "makerjs";

export const arc: PrimitiveFunction = {
    name: "arc",
    label: "Arc",
    description: "Creates a arc",
    inputs: {
        o: { type: "Point", default: [0, 0] },
        r: { type: "number", default: 10 },
        s: { type: "number", default: 0 },
        e: { type: "number", default: 90 },
    },
    outputs: {
        a: "Arc",
    },
    impl: async (inputs) => {
        return {
            a: nAryOnTree(
                [inputs.o, inputs.r, inputs.s, inputs.e],
                ([o, r, s, e]) => {
                    return new paths.Arc(o, r, s, e);
                },
                true
            ),
        };
    },
};
