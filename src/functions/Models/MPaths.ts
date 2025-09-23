import { mapTree, PrimitiveFunction } from "@rkmodules/rules";

export const mPaths: PrimitiveFunction = {
    name: "mPaths",
    label: "Model Paths",
    description: "Deconstructs a model to its paths",
    inputs: {
        shape: "Model",
    },
    outputs: {
        paths: "Path",
    },
    impl: async (inputs) => {
        return {
            paths: mapTree(inputs.shape, (m) => {
                return Object.values(m.paths);
            }),
        };
    },
};
