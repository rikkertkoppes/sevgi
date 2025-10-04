import { BaseGeometry } from "@/Core/Geometry/BaseGeometry";
import { Point, v2 } from "@/Core/Geometry/Vector";
import { binaryOnTree, DISCARD, PrimitiveFunction } from "@rkmodules/rules";

export const move: PrimitiveFunction = {
    name: "move",
    label: "Move",
    description: "Move geometry by an offset",
    inputs: {
        geometry: "Geometry",
        offset: { type: "Point", default: v2(0, 0) },
    },
    outputs: {
        geometry: "Geometry",
    },
    impl: async (inputs) => {
        return {
            geometry: binaryOnTree(
                inputs.geometry || {},
                inputs.offset,
                (m: BaseGeometry, o: Point) => {
                    return m?.translate(o) || DISCARD;
                },
                true
            ),
        };
    },
};
