import { Circle } from "@/Core/Geometry/Circle";
import { Point, v2 } from "@/Core/Geometry/Vector";
import { binaryOnTree, PrimitiveFunction } from "@rkmodules/rules";

export const circle: PrimitiveFunction = {
    name: "circle",
    label: "Circle",
    description: "Creates a circle",
    inputs: {
        center: { type: "Point", default: v2(0, 0) },
        radius: { type: "number", default: 10 },
    },
    outputs: {
        path: "Circle",
    },
    impl: async (inputs) => {
        const circle = binaryOnTree(
            inputs.center,
            inputs.radius,
            (o: Point, r: number) => {
                return new Circle(o, r);
            },
            true
        );
        return {
            path: circle,
        };
    },
};
