import { v2 } from "@/Core/Geometry/Vector";
import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";

export const point: PrimitiveFunction = {
    name: "point",
    label: "Point",
    description: "Create a point",
    inputs: {
        x: { type: "number", default: 0 },
        y: { type: "number", default: 0 },
    },
    outputs: {
        point: "Point",
    },
    impl: async function PointImpl(inputs) {
        return {
            point: binaryOnTree(
                inputs.x,
                inputs.y,
                (x = 0, y = 0) => {
                    return v2(x, y);
                },
                true
            ),
        };
    },
};
