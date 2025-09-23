import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";

export const point: PrimitiveFunction = {
    name: "point",
    label: "Point",
    description: "Create a point",
    inputs: {
        x: { type: "number", default: 0 },
        y: { type: "number", default: 0 },
    },
    outputs: {
        point: "Point",
    },
    impl: async (inputs) => {
        return {
            point: binaryOnTree(
                inputs.x,
                inputs.y,
                (x: number, y: number) => {
                    return [x, y];
                },
                true
            ),
        };
    },
};
