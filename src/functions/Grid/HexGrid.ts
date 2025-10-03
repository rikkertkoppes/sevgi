import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { linesToCells } from "./linesToCells";
import { LineSegment } from "@/Core/Geometry/Line";
import { Point, v2 } from "@/Core/Geometry/Vector";

export const hexGrid: PrimitiveFunction = {
    name: "hexGrid",
    label: "Hexagonal Grid",
    description: "Creates a hexagonal grid",
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

        const points: Point[] = [];
        const lines: LineSegment[] = [];

        const nx = Math.floor(params.nx * 1.5) + 1;
        const ny = params.ny * 2 + 2;
        const hSpace = params.size;
        const vSpace = (params.size * Math.sqrt(3)) / 2;
        for (let j = 0; j < ny; j++) {
            const isLower = j % 2 === 0;
            const isMid = !isLower;
            const pointsInRow = nx + (j % 2);
            const dx = (1 - (j % 2)) * (hSpace / 2);
            for (let i = 0; i < pointsInRow; i++) {
                const x = i * hSpace + dx;
                const y = j * vSpace;
                const p = getUnique(v2(x, y));
                if ((isMid && i % 3 !== 1) || (isLower && i % 3 !== 2)) {
                    points.push(p);
                }
                if (
                    i < pointsInRow - 1 &&
                    ((isLower && i % 3 === 0) || (isMid && i % 3 === 2))
                ) {
                    // horizontal line
                    const p2 = getUnique(v2(x + hSpace, y));
                    lines.push(new LineSegment(p, p2));
                }
                if (isLower && i % 3 === 0 && j < ny - 1) {
                    // backward
                    const p2 = getUnique(v2(x - hSpace / 2, y + vSpace));
                    lines.push(new LineSegment(p, p2));
                }
                if (isLower && i % 3 === 1 && j < ny - 1) {
                    // forward
                    const p2 = getUnique(v2(x + hSpace / 2, y + vSpace));
                    lines.push(new LineSegment(p, p2));
                }
                if (isMid && i % 3 === 0 && j < ny - 1) {
                    // forward
                    const p2 = getUnique(v2(x + hSpace / 2, y + vSpace));
                    lines.push(new LineSegment(p, p2));
                }
                if (isMid && i % 3 === 2 && j < ny - 1) {
                    // backward
                    const p2 = getUnique(v2(x - hSpace / 2, y + vSpace));
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
