import { RegularPolygon } from "@/Core/Geometry/RegularPolygon";
import { v2 } from "@/Core/Geometry/Vector";
import { nAryOnTree, PrimitiveFunction } from "@rkmodules/rules";

export const polygon: PrimitiveFunction = {
    name: "polygon",
    label: "Polygon",
    description: "Creates a polygon",
    inputs: {
        center: { type: "Point", default: v2(0, 0) },
        sides: { type: "number", default: 6 },
        radius: { type: "number", default: 10 },
        angle: { type: "number", default: 0 },
        useOuter: { type: "boolean", default: false },
    },
    outputs: {
        shape: "PolyLine",
    },
    impl: async function PolygonImpl(inputs) {
        const shape = nAryOnTree(
            [
                inputs.center,
                inputs.sides,
                inputs.radius,
                inputs.angle,
                inputs.useOuter,
            ],
            ([o, n, r, a, or]) => {
                return RegularPolygon.from(o, n, r, a, or);
            },
            true
        );

        return {
            shape,
        };
    },
};
