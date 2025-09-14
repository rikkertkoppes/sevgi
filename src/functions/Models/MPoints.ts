import { mapTree, PrimitiveFunction } from "@rkmodules/rules";
import { model, chain } from "makerjs";

export const mPoints: PrimitiveFunction = {
    name: "mPoints",
    label: "Model Points",
    description: "Find points in a model",
    inputs: {
        m: "Model",
    },
    outputs: {
        p: "Point",
    },
    impl: async (inputs) => {
        return {
            p: mapTree(
                mapTree(inputs.m, (m) => model.findChains(m)),
                (c) => chain.toKeyPoints(c)
            ),
        };
    },
};
