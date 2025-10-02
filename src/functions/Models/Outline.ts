import { PolyLine } from "@/Core/Geometry/PolyLine";
import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";

export const outline: PrimitiveFunction = {
    name: "outline",
    label: "Outline",
    description:
        "Outline a PolyLine by a specified distance. Useful for accommodating for kerf",
    inputs: {
        shape: "PolyLine",
        d: { type: "number", default: 1 },
    },
    params: {
        join: {
            type: "string",
            options: ["miter", "round", "bevel", "none"],
            default: "miter",
        },
    },
    outputs: {
        shape: "PolyLine",
    },
    impl: async (inputs, params) => {
        return {
            shape: binaryOnTree(
                inputs.shape || {},
                inputs.d,

                (m: PolyLine, d: number) => {
                    if (params.inside) d = -d;
                    return m?.offset(d, params.join);
                },
                true
            ),
        };
    },
};
