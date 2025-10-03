import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { linesToCells } from "./linesToCells";
import { Point, v2 } from "@/Core/Geometry/Vector";
import { LineSegment } from "@/Core/Geometry/LineSegment";

export const rectGrid: PrimitiveFunction = {
    name: "rectGrid",
    label: "Square Grid",
    description: "Creates a square grid",
    inputs: {},
    params: {
        size: { type: "number", default: 10 },
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

        const lines: LineSegment[] = [];

        const nx = params.nx + 1;
        const ny = params.ny + 1;
        const hSpace = params.size;
        const vSpace = params.size;
        for (let i = 0; i < nx; i++) {
            for (let j = 0; j < ny; j++) {
                const p = getUnique(v2(i * hSpace, j * vSpace));
                if (i < nx - 1) {
                    const p2 = getUnique(v2((i + 1) * hSpace, j * vSpace));
                    lines.push(new LineSegment(p, p2));
                }
                if (j < ny - 1) {
                    const p2 = getUnique(v2(i * hSpace, (j + 1) * vSpace));
                    lines.push(new LineSegment(p, p2));
                }
            }
        }

        const models = linesToCells(lines);

        return {
            shapes: broadCast(models),
            lines: broadCast(lines),
            points: broadCast(Object.values(pointsMap)),
        };
    },
};
