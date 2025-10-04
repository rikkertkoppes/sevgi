import { v2 } from "@/Core/Geometry/Vector";
import {
    broadCast,
    DISCARD,
    nAryOnTree,
    PrimitiveFunction,
} from "@rkmodules/rules";

export const scale: PrimitiveFunction = {
    name: "scale",
    label: "Scale",
    description: "Scale geometry with respect to a center point",
    inputs: {
        geometry: "Geometry",
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
        geometry: "Geometry",
    },
    impl: async (inputs) => {
        return {
            geometry: nAryOnTree(
                [
                    inputs.geometry || {},
                    inputs.scale,
                    inputs.center || broadCast(v2(0, 0)),
                ],
                ([m, s, c]) => {
                    return m?.scale(s, c) || DISCARD;
                },
                true
            ),
        };
    },
};
