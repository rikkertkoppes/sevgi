import { toRadians } from "@/Core/Geometry/Util";
import { v2 } from "@/Core/Geometry/Vector";
import { broadCast, nAryOnTree, PrimitiveFunction } from "@rkmodules/rules";

export const rotate: PrimitiveFunction = {
    name: "rotate",
    label: "Rotate",
    description: "Rotate a PolyLine around a point",
    inputs: {
        shape: "PolyLine",
        angle: { type: "number", default: 0 },
        center: { type: "Point", default: v2(0, 0) },
    },
    outputs: {
        shape: "PolyLine",
    },
    impl: async (inputs) => {
        return {
            shape: nAryOnTree(
                [
                    inputs.shape,
                    inputs.angle,
                    inputs.center || broadCast(v2(0, 0)),
                ],
                ([m, a, p]) => {
                    return m.rotate(toRadians(a), p);
                },
                true
            ),
        };
    },
};
