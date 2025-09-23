import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";
import { IModel, model } from "makerjs";

export const move: PrimitiveFunction = {
    name: "move",
    label: "Move",
    description: "Move a model to an absolute poinl",
    inputs: {
        point: { type: "Point", default: [[0, 0]] },
        shape: "Model",
    },
    outputs: {
        shape: "Model",
    },
    impl: async (inputs) => {
        return {
            shape: binaryOnTree(
                inputs.point,
                inputs.shape,
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
