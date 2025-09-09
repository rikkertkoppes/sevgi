import { nAryOnTree, PrimitiveFunction } from "@rkmodules/rules";

import { paths } from "makerjs";

export const arc: PrimitiveFunction = {
    name: "arc",
    label: "Arc",
    description: "Creates a arc",
    inputs: {
        o: "Point",
        r: "number",
        s: "number",
        e: "number",
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
                }
            ),
        };
    },
};
