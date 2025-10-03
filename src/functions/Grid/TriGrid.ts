import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { linesToCells } from "./linesToCells";
import { LineSegment } from "@/Core/Geometry/Line";
import { Point, v2 } from "@/Core/Geometry/Vector";

export const triGrid: PrimitiveFunction = {
    name: "triGrid",
    label: "Triangular Grid",
    description: "Creates a triangular grid",
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

        const nx = Math.ceil(params.nx / 2) + 1;
        const ny = params.ny + 1;
        const hSpace = params.size;
        const vSpace = params.size * (Math.sqrt(3) / 2);
        for (let j = 0; j < ny; j++) {
            const pointsInRow = nx - (j % 2) * (params.nx % 2);
            const dx = (j % 2) * (hSpace / 2);
            for (let i = 0; i < pointsInRow; i++) {
                const x = i * hSpace + dx;
                const y = j * vSpace;
                const p = getUnique(v2(x, y));
                if (i < pointsInRow - 1) {
                    // horizontal line
                    const p2 = getUnique(v2(x + hSpace, y));
                    lines.push(new LineSegment(p, p2));
                }
                if (j < ny - 1) {
                    if (j % 2 === 1 || i > 0) {
                        // backward tilted
                        const p2 = getUnique(v2(x - hSpace / 2, y + vSpace));
                        lines.push(new LineSegment(p, p2));
                    }
                    if (i < nx - 1 || (j % 2 === 0 && params.nx % 2 === 0)) {
                        // forward tilted
                        const p2 = getUnique(v2(x + hSpace / 2, y + vSpace));
                        lines.push(new LineSegment(p, p2));
                    }
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
