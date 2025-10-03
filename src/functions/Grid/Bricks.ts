import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { linesToCells } from "./linesToCells";
import { LineSegment } from "@/Core/Geometry/LineSegment";
import { Point, v2 } from "@/Core/Geometry/Vector";

export const bricks: PrimitiveFunction = {
    name: "bricks",
    label: "Bricks",
    description: "Creates a bricks grid",
    inputs: {},
    params: {
        width: { type: "number", default: 100 },
        height: { type: "number", default: 100 },
        nx: { type: "number", default: 5 },
        ny: { type: "number", default: 5 },
    },
    outputs: {
        shapes: "PolyLine",
        lines: "Line",
        points: "Point",
    },
    impl: async (inputs, params) => {
        const pointsMap: Record<string, Point> = {};

        function getUnique(p: Point) {
            const h = p.hash();
            if (pointsMap[h]) {
                return pointsMap[h];
            } else {
                pointsMap[h] = p;
                return p;
            }
        }

        const points: Point[] = [];
        const lines: LineSegment[] = [];

        const nx = params.nx + 1;
        const ny = params.ny * 2 + 1;
        const hSpace = params.width / (nx - 1);
        const vSpace = params.height / (ny - 1);
        for (let j = 0; j < ny; j++) {
            for (let i = 0; i < nx; i++) {
                const p = getUnique(v2(i * hSpace, j * vSpace));
                points.push(p);

                if (j % 2 === i % 2 && i < nx - 1) {
                    // horizontal line
                    const p2 = getUnique(v2((i + 1) * hSpace, j * vSpace));
                    lines.push(new LineSegment(p, p2));
                }
                if (j < ny - 1) {
                    // vertical line
                    const p2 = getUnique(v2(i * hSpace, (j + 1) * vSpace));
                    lines.push(new LineSegment(p, p2));
                }
            }
        }

        const models = linesToCells(lines);

        return {
            shapes: broadCast(models),
            lines: broadCast(lines),
            points: broadCast(points),
        };
    },
};
