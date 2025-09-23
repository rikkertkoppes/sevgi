import { mapTree, PrimitiveFunction, Tree } from "@rkmodules/rules";
import { model, chain } from "makerjs";

export const mPoints: PrimitiveFunction = {
    name: "mPoints",
    label: "Model Points",
    description: "Find points in a model",
    inputs: {
        shape: "Model",
    },
    outputs: {
        points: "Point",
    },
    impl: async (inputs) => {
        const chains = mapTree(
            inputs.shape,
            (m) => model.findChains(m) as any
        ) as Tree<MakerJs.IChain>;
        return {
            points: mapTree(chains, (c) => chain.toKeyPoints(c)),
        };
    },
};
