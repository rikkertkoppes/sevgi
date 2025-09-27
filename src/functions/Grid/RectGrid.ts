import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { linesToCells } from "./linesToCells";
import { Point, v2 } from "@/Core/Geometry/Vector";
import { LineSegment } from "@/Core/Geometry/Line";

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
        points: "Point",
        lines: "Line",
        shapes: "PolyLine",
    },
    impl: async (inputs, params) => {
        const points: Point[] = [];
        const lines: LineSegment[] = [];

        const nx = params.nx + 1;
        const ny = params.ny + 1;
        const hSpace = params.size;
        const vSpace = params.size;
        for (let i = 0; i < nx; i++) {
            for (let j = 0; j < ny; j++) {
                points.push(v2(i * hSpace, j * vSpace));
                if (i < nx - 1) {
                    lines.push(
                        new LineSegment(
                            v2(i * hSpace, j * vSpace),
                            v2((i + 1) * hSpace, j * vSpace)
                        )
                    );
                }
                if (j < ny - 1) {
                    lines.push(
                        new LineSegment(
                            v2(i * hSpace, j * vSpace),
                            v2(i * hSpace, (j + 1) * vSpace)
                        )
                    );
                }
            }
        }

        const models = linesToCells(lines);

        return {
            points: broadCast(points),
            lines: broadCast(lines),
            shapes: broadCast(models),
        };
    },
};
