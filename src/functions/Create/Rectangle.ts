import { Rectangle } from "@/Core/Geometry/Rectangle";
import { v2 } from "@/Core/Geometry/Vector";
import { nAryOnTree, PrimitiveFunction } from "@rkmodules/rules";

export const rectangle: PrimitiveFunction = {
    name: "rectangle",
    label: "Rectangle",
    description: "Creates a rectangle",
    inputs: {
        center: { type: "Point", default: v2(0, 0) },
        width: { type: "number", default: 10 },
        height: { type: "number", default: 10 },
    },
    outputs: {
        shape: "PolyLine",
    },
    impl: async function RectangleImpl(inputs) {
        const shape = nAryOnTree(
            [inputs.center, inputs.width, inputs.height],
            ([c, w, h]) => {
                return Rectangle.fromDimensions(c, w, h);
            },
            true
        );

        return {
            shape,
        };
    },
};
