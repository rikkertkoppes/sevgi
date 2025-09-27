import { mapTree, PrimitiveFunction } from "@rkmodules/rules";

export const destructPoint: PrimitiveFunction = {
    name: "destructPoint",
    label: "Destruct Point",
    description: "Destruct a point into x and y components",
    inputs: {
        point: "Point",
    },
    outputs: {
        x: "number",
        y: "number",
    },
    impl: async (inputs) => {
        return {
            x: mapTree(inputs.point, (p) => p.x),
            y: mapTree(inputs.point, (p) => p.y),
        };
    },
};
