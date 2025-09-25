import { mapTree, PrimitiveFunction } from "@rkmodules/rules";
import { chain, model } from "makerjs";

export const center: PrimitiveFunction = {
    name: "center",
    label: "Center",
    description: "Center of a model",
    inputs: {
        shape: "Model",
    },
    outputs: {
        point: "Point",
        x: "number",
        y: "number",
    },
    impl: async (inputs) => {
        const point = mapTree(inputs.shape, (m) => {
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
        });
        return {
            point,
            x: mapTree(point, (p) => p[0]),
            y: mapTree(point, (p) => p[1]),
        };
    },
};
