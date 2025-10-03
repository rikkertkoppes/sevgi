import { toRadians } from "@/Core/Geometry/Util";
import { v2 } from "@/Core/Geometry/Vector";
import { broadCast, nAryOnTree, PrimitiveFunction } from "@rkmodules/rules";

export const rotate: PrimitiveFunction = {
    name: "rotate",
    label: "Rotate",
    description: "Rotate geometry around a point",
    inputs: {
        geometry: "Geometry",
        angle: { type: "number", default: 0 },
        center: { type: "Point", default: v2(0, 0) },
    },
    outputs: {
        geometry: "Geometry",
    },
    impl: async (inputs) => {
        return {
            geometry: nAryOnTree(
                [
                    inputs.geometry,
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
