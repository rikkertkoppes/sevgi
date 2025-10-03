import { LineSegment } from "@/Core/Geometry/LineSegment";
import { PolyLine } from "@/Core/Geometry/PolyLine";
import { Point, sum, v2 } from "@/Core/Geometry/Vector";
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
    impl: async (inputs) => {
        const shape = nAryOnTree(
            [
                inputs.center,
                inputs.sides,
                inputs.radius,
                inputs.angle,
                inputs.useOuter,
            ],
            ([o, n, r, a, or]) => {
                const points: Point[] = [];
                // when or is true, shrink r such that the polygon inner circle has radius r
                if (!or) {
                    r = r / Math.cos(Math.PI / n);
                }
                for (let i = 0; i < n; i++) {
                    const theta = (2 * Math.PI * i) / n + (a * Math.PI) / 180;
                    const x = r * Math.cos(theta);
                    const y = r * Math.sin(theta);
                    points.push(sum(o, v2(x, y)));
                }

                const lines = points.map((p, i) => {
                    const other = points[(i + 1) % points.length];
                    return new LineSegment(p, other);
                });

                const poly = new PolyLine(lines);

                return poly;
            },
            true
        );

        return {
            shape,
        };
    },
};
