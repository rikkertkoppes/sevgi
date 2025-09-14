import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";
import { model, measure } from "makerjs";

export const scale: PrimitiveFunction = {
    name: "scale",
    label: "Scale",
    description: "Scale a model",
    inputs: {
        m: "Model",
        s: "number",
    },
    outputs: {
        m: "Model",
    },
    impl: async (inputs) => {
        return {
            m: binaryOnTree(
                inputs.m,
                inputs.s,
                (m, s) => {
                    // TODO: add center input and scale arount that point
                    // also add center node
                    m = model.clone(m);
                    const exts = measure.modelExtents(m);
                    model.center(m);
                    model.originate(m);
                    model.scale(m, s);
                    model.move(m, exts.center);
                    return m;
                },
                true
            ),
        };
    },
};
