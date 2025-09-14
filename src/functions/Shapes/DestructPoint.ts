import { mapTree, PrimitiveFunction } from "@rkmodules/rules";

export const destructPoint: PrimitiveFunction = {
    name: "destructPoint",
    label: "Destruct Point",
    description: "Destruct a point into x and y components",
    inputs: {
        p: "Point",
    },
    outputs: {
        x: "number",
        y: "number",
    },
    impl: async (inputs) => {
        return {
            x: mapTree(inputs.p, (p) => p[0]),
            y: mapTree(inputs.p, (p) => p[1]),
        };
    },
};
