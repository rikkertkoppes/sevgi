import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";
import { IModel, IPoint, model } from "makerjs";

export const move: PrimitiveFunction = {
    name: "move",
    label: "Move",
    description: "Move a model to an absolute poinl",
    inputs: {
        shape: "Model",
        point: { type: "Point", default: [[0, 0]] },
    },
    outputs: {
        shape: "Model",
    },
    impl: async (inputs) => {
        return {
            shape: binaryOnTree(
                inputs.shape,
                inputs.point,
                (m: IModel, o: IPoint) => {
                    m = model.clone(m);
                    model.move(m, o);
                    return m;
                },
                true
            ),
        };
    },
};
