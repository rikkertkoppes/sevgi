import { broadCast, nAryOnTree, PrimitiveFunction } from "@rkmodules/rules";
import { model } from "makerjs";

export const scale: PrimitiveFunction = {
    name: "scale",
    label: "Scale",
    description: "Scale a model",
    inputs: {
        shape: "Model",
        scale: {
            type: "number",
            default: 0.5,
        },
        center: {
            type: "Point",
            default: [0, 0],
        },
    },
    outputs: {
        shape: "Model",
    },
    impl: async (inputs) => {
        return {
            shape: nAryOnTree(
                [
                    inputs.shape,
                    inputs.scale,
                    inputs.center || broadCast([[0, 0]]),
                ],
                ([m, s, c]) => {
                    m = model.clone(m);
                    model.originate(m, c);
                    model.scale(m, s);
                    return m;
                },
                true
            ),
        };
    },
};
