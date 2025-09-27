import { PolyLine } from "@/Core/Geometry/PolyLine";
import { Point, v2 } from "@/Core/Geometry/Vector";
import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";

export const move: PrimitiveFunction = {
    name: "move",
    label: "Move",
    description: "Move a PolyLine by an offset",
    inputs: {
        shape: "PolyLine",
        offset: { type: "Point", default: v2(0, 0) },
    },
    outputs: {
        shape: "PolyLine",
    },
    impl: async (inputs) => {
        return {
            shape: binaryOnTree(
                inputs.shape,
                inputs.offset,
                (m: PolyLine, o: Point) => {
                    return m.translate(o);
                },
                true
            ),
        };
    },
};
