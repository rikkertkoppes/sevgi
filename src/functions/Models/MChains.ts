import { mapTree, PrimitiveFunction } from "@rkmodules/rules";
import { model } from "makerjs";

export const mChains: PrimitiveFunction = {
    name: "mChains",
    label: "Model Chains",
    description: "Find chains in a model",
    inputs: {
        m: "Model",
    },
    outputs: {
        m: "Model",
    },
    impl: async (inputs) => {
        return {
            m: mapTree(inputs.m, (m) => {
                return model.findChains(m);
            }),
        };
    },
};
