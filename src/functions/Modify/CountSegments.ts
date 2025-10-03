import { PolyLine } from "@/Core/Geometry/PolyLine";
import { mapTree, PrimitiveFunction } from "@rkmodules/rules";

export const countSegments: PrimitiveFunction = {
    name: "countSegments",
    label: "Count Segments",
    description: "Count the number of segments in a model",
    inputs: {
        shape: "PolyLine",
    },
    outputs: {
        count: "number",
    },
    impl: async (inputs) => {
        return {
            count: mapTree(inputs.shape, (m: PolyLine) => {
                return m.getSegments().length;
            }),
        };
    },
};
