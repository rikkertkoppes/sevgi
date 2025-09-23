import { mapTree, PrimitiveFunction } from "@rkmodules/rules";
import { model } from "makerjs";

export const countSegments: PrimitiveFunction = {
    name: "countSegments",
    label: "Count Segments",
    description: "Count the number of segments in a model",
    inputs: {
        m: "Model",
    },
    outputs: {
        count: "number",
    },
    impl: async (inputs) => {
        return {
            count: mapTree(inputs.m, (m) => {
                let count = 0;
                model.walk(m, {
                    onPath: () => {
                        count++;
                    },
                });
                return count;
            }),
        };
    },
};
