import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";
import { IModel, model } from "makerjs";

export const move: PrimitiveFunction = {
    name: "move",
    label: "Move",
    description: "Move a model to an absolute poinl",
    inputs: {
        o: { type: "Point", default: [0, 0] },
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
                (o, m: IModel) => {
                    m = model.clone(m);
                    model.move(m, o);
                    return m;
                },
                true
            ),
        };
    },
};
