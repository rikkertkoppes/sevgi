import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";
import { model } from "makerjs";

export const move: PrimitiveFunction = {
    name: "move",
    label: "Move",
    description: "Move a model to an absolute poinl",
    inputs: {
        o: "Point",
        m: "Model",
    },
    outputs: {
        m: "Model",
    },
    impl: async (inputs) => {
        return {
            m: binaryOnTree(
                inputs.o,
                inputs.m,
                (o, m) => {
                    m = model.clone(m);
                    m.move(o);
                    return m;
                },
                true
            ),
        };
    },
};
