import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";

import { paths, IPoint } from "makerjs";

export const edge: PrimitiveFunction = {
    name: "edge",
    label: "Edge",
    description: "Creates an edge",
    inputs: {
        a: "Point",
        b: "Point",
    },
    outputs: {
        e: "Edge",
    },
    impl: async (inputs) => {
        return {
            e: binaryOnTree(inputs.a, inputs.b, (a: IPoint, b: IPoint) => {
                return new paths.Line(a, b);
            }),
        };
    },
};
