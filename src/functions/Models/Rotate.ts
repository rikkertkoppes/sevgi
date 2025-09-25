import { broadCast, nAryOnTree, PrimitiveFunction } from "@rkmodules/rules";
import { model } from "makerjs";

export const rotate: PrimitiveFunction = {
    name: "rotate",
    label: "Rotate",
    description: "Rotate a model around a point",
    inputs: {
        shape: "Model",
        angle: { type: "number", default: 0 },
        center: { type: "Point", default: [[0, 0]] },
    },
    outputs: {
        shape: "Model",
    },
    impl: async (inputs) => {
        return {
            shape: nAryOnTree(
                [
                    inputs.shape,
                    inputs.angle,
                    inputs.center || broadCast([[0, 0]]),
                ],
                ([m, a, p]) => {
                    m = model.clone(m);
                    model.rotate(m, a, p);

                    return m;
                },
                true
            ),
        };
    },
};
