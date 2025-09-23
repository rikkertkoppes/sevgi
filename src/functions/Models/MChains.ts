import { mapTree, PrimitiveFunction } from "@rkmodules/rules";
import { model } from "makerjs";

export const mChains: PrimitiveFunction = {
    name: "mChains",
    label: "Model Chains",
    description: "Find chains in a model",
    inputs: {
        shape: "Model",
    },
    outputs: {
        shape: "Model",
    },
    impl: async (inputs) => {
        return {
            shape: mapTree(inputs.shape, (m) => {
                return model.findChains(m);
            }),
        };
    },
};
