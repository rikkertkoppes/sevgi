import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";

import { paths, IPoint } from "makerjs";

export const circle: PrimitiveFunction = {
    name: "circle",
    label: "Circle",
    description: "Creates a circle",
    inputs: {
        center: { type: "Point", default: [[0, 0]] },
        radius: { type: "number", default: 10 },
    },
    outputs: {
        path: "Circle",
    },
    impl: async (inputs) => {
        const circle = binaryOnTree(
            inputs.center,
            inputs.radius,
            (o: IPoint, r: number) => {
                return new paths.Circle(o, r);
            },
            true
        );
        return {
            path: circle,
        };
    },
};
