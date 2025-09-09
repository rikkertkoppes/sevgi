import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";

import { paths, IPoint } from "makerjs";

export const line: PrimitiveFunction = {
    name: "line",
    label: "Line",
    description: "Creates a line",
    inputs: {
        o: "Point",
        e: "Point",
    },
    outputs: {
        l: "Line",
    },
    impl: async (inputs) => {
        return {
            l: binaryOnTree(inputs.o, inputs.e, (o: IPoint, e: IPoint) => {
                return new paths.Line(o, e);
            }),
        };
    },
};
