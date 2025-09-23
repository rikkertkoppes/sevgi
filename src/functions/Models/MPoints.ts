import { mapTree, PrimitiveFunction, Tree } from "@rkmodules/rules";
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
        const chains = mapTree(
            inputs.m,
            (m) => model.findChains(m) as any
        ) as Tree<MakerJs.IChain>;
        return {
            p: mapTree(chains, (c) => chain.toKeyPoints(c)),
        };
    },
};
