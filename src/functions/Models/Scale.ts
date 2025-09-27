import { v2 } from "@/Core/Geometry/Vector";
import { broadCast, nAryOnTree, PrimitiveFunction } from "@rkmodules/rules";

export const scale: PrimitiveFunction = {
    name: "scale",
    label: "Scale",
    description: "Scale a PolyLine with respect to a center point",
    inputs: {
        shape: "PolyLine",
        scale: {
            type: "number",
            default: 0.5,
        },
        center: {
            type: "Point",
            default: v2(0, 0),
        },
    },
    outputs: {
        shape: "PolyLine",
    },
    impl: async (inputs) => {
        return {
            shape: nAryOnTree(
                [
                    inputs.shape,
                    inputs.scale,
                    inputs.center || broadCast(v2(0, 0)),
                ],
                ([m, s, c]) => {
                    return m.scale(s, c);
                },
                true
            ),
        };
    },
};
