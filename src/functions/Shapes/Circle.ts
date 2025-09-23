import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";

import { paths, IPoint } from "makerjs";

export const circle: PrimitiveFunction = {
    name: "circle",
    label: "Circle",
    description: "Creates a circle",
    inputs: {
        o: { type: "Point", default: [[0, 0]] },
        r: { type: "number", default: 10 },
    },
    outputs: {
        c: "Circle",
    },
    impl: async (inputs) => {
        return {
            c: binaryOnTree(
                inputs.o,
                inputs.r,
                (o: IPoint, r: number) => {
                    return new paths.Circle(o, r);
                },
                true
            ),
        };
    },
};
