import { mapTree, PrimitiveFunction } from "@rkmodules/rules";
import { chain, model } from "makerjs";

export const center: PrimitiveFunction = {
    name: "center",
    label: "Center",
    description: "Center of a model",
    inputs: {
        m: "Model",
    },
    outputs: {
        p: "Point",
    },
    impl: async (inputs) => {
        return {
            p: mapTree(inputs.m, (m) => {
                const chains = model.findChains(m) as MakerJs.IChain[];
                const points = chains.flatMap((c) => chain.toKeyPoints(c));
                const center = points.reduce(
                    (acc, p) => [
                        acc[0] + p[0] / points.length,
                        acc[1] + p[1] / points.length,
                    ],
                    [0, 0]
                ) as MakerJs.IPoint;

                return [center];
            }),
        };
    },
};
