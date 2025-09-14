import { broadCast, nAryOnTree, PrimitiveFunction } from "@rkmodules/rules";
import { model } from "makerjs";

export const scale: PrimitiveFunction = {
    name: "scale",
    label: "Scale",
    description: "Scale a model",
    inputs: {
        m: "Model",
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
        m: "Model",
    },
    impl: async (inputs) => {
        return {
            m: nAryOnTree(
                [inputs.m, inputs.scale, inputs.center || broadCast([[0, 0]])],
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
