import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";

import { paths, IPoint } from "makerjs";

export const line: PrimitiveFunction = {
    name: "line",
    label: "Line",
    description: "Creates a line",
    inputs: {
        start: { type: "Point", default: [[0, 0]] },
        end: { type: "Point", default: [[10, 10]] },
    },
    outputs: {
        path: "Line",
    },
    impl: async (inputs) => {
        return {
            path: binaryOnTree(
                inputs.start,
                inputs.end,
                (o: IPoint, e: IPoint) => {
                    return new paths.Line(o, e);
                },
                true
            ),
        };
    },
};
