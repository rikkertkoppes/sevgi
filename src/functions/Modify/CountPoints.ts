import { PolyLine } from "@/Core/Geometry/PolyLine";
import { DISCARD, mapTree, PrimitiveFunction } from "@rkmodules/rules";

export const countPoints: PrimitiveFunction = {
    name: "countPoints",
    label: "Count Points",
    description: "Count the number of points in a model",
    inputs: {
        shape: "PolyLine",
    },
    outputs: {
        count: "number",
    },
    impl: async (inputs) => {
        return {
            count: mapTree(inputs.shape || {}, (m: PolyLine) => {
                return m?.getPoints().length || DISCARD;
            }),
        };
    },
};
