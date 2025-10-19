import { Rectangle } from "@/Core/Geometry/Rectangle";
import { v2 } from "@/Core/Geometry/Vector";
import { nAryOnTree, PrimitiveFunction } from "@rkmodules/rules";

export const box: PrimitiveFunction = {
    name: "box",
    label: "Box",
    description: "Creates a box",
    inputs: {
        lowerLeft: { type: "Point", default: v2(0, 0) },
        upperRight: { type: "Point", default: v2(10, 10) },
    },
    outputs: {
        shape: "PolyLine",
    },
    impl: async function BoxImpl(inputs) {
        const shape = nAryOnTree(
            [inputs.lowerLeft, inputs.upperRight],
            ([ll, ur]) => {
                return Rectangle.fromBounds(ll, ur);
            },
            true
        );

        return {
            shape,
        };
    },
};
