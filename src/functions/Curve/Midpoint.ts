import { Curve } from "@/Core/Geometry/Curve";
import { mapTree, PrimitiveFunction } from "@rkmodules/rules";

export const midpoint: PrimitiveFunction = {
    name: "midpoint",
    label: "Midpoint",
    description: "Returns the midpoint of a line or arc",
    inputs: {
        curve: { type: "Line" },
    },
    outputs: {
        point: "Point",
    },
    impl: async (inputs) => {
        return {
            point: mapTree(inputs.curve, (p: Curve) => {
                return p.pointAt(0.5);
            }),
        };
    },
};
