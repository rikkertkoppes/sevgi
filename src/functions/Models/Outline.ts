import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";
import { model } from "makerjs";

export const outline: PrimitiveFunction = {
    name: "outline",
    label: "Outline",
    description:
        "Outline a model by a specified distance. Useful for accommodating for kerf",
    inputs: {
        m: "Model",
        d: "number",
    },
    params: {
        joints: "number",
        inside: "boolean",
    },
    outputs: {
        m: "Model",
    },
    impl: async (inputs, params) => {
        return {
            m: binaryOnTree(
                inputs.m,
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
