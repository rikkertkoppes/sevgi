import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";

export const point: PrimitiveFunction = {
    name: "point",
    label: "Point",
    description: "Create a point",
    inputs: {
        x: "number",
        y: "number",
    },
    outputs: {
        p: "Point",
    },
    impl: async (inputs) => {
        return {
            p: binaryOnTree(inputs.x, inputs.y, (x: number, y: number) => {
                return [x, y];
            }),
        };
    },
};
