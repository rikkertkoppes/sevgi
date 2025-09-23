import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";
import { model } from "makerjs";

export const outline: PrimitiveFunction = {
    name: "outline",
    label: "Outline",
    description:
        "Outline a model by a specified distance. Useful for accommodating for kerf",
    inputs: {
        shape: "Model",
        d: { type: "number", default: 1 },
    },
    params: {
        joints: { type: "number", default: 0 },
        inside: { type: "boolean", default: false },
    },
    outputs: {
        shape: "Model",
    },
    impl: async (inputs, params) => {
        return {
            shape: binaryOnTree(
                inputs.shape,
                inputs.d,

                (m, d) => {
                    m = model.clone(m);
                    m = model.outline(m, d, params.joints, params.inside);
                    return m;
                },
                true
            ),
        };
    },
};
