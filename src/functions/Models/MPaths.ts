import { mapTree, PrimitiveFunction } from "@rkmodules/rules";

export const mPaths: PrimitiveFunction = {
    name: "mPaths",
    label: "Model Paths",
    description: "Deconstructs a model to its paths",
    inputs: {
        m: "Model",
    },
    outputs: {
        p: "Path",
    },
    impl: async (inputs) => {
        return {
            p: mapTree(inputs.m, (m) => {
                return Object.values(m.paths);
            }),
        };
    },
};
