import { mapTree, PrimitiveFunction } from "@rkmodules/rules";
import { measure } from "makerjs";

export const center: PrimitiveFunction = {
    name: "center",
    label: "Center",
    description: "Center of a model",
    inputs: {
        m: "Model",
    },
    outputs: {
        p: "Point",
    },
    impl: async (inputs) => {
        return {
            p: mapTree(inputs.m, (m) => {
                const exts = measure.modelExtents(m);
                return [exts.center];
            }),
        };
    },
};
