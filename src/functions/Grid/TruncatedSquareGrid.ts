import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { IPoint, paths } from "makerjs";
import { linesToCells } from "./liensToCells";
import { Point, rot, sum, v2 } from "@/Core/Geometry/Vector";

export const truncatedSquareGrid: PrimitiveFunction = {
    name: "truncatedSquareGrid",
    label: "Truncated Square Grid",
    description:
        "Creates a truncated square grid made up of octagons and squares",
    inputs: {},
    params: {
        size: { type: "number", default: 10 },
        nx: { type: "number", default: 5 },
        ny: { type: "number", default: 5 },
    },
    outputs: {
        points: "Point",
        lines: "Line",
        shapes: "Model",
    },
    impl: async (inputs, params) => {
        const points: IPoint[] = [];
        const lines: paths.Line[] = [];

        const nx = params.nx;
        const ny = params.ny;
        const s = params.size;
        const sl = s / (1 + Math.sqrt(2));
        for (let i = 0; i < nx; i++) {
            for (let j = 0; j < ny; j++) {
                const pts: Point[] = [];
                let p = v2(i * s, j * s);
                pts.push(p);
                let v = v2(sl, 0);
                // create the octagon
                for (let k = 1; k < 8; k++) {
                    p = sum(p, v);
                    pts.push(p);
                    v = rot(Math.PI / 4, v);
                }
                points.push(...pts.map(Point.toArray));
                lines.push(
                    ...pts.map((p1, i) => {
                        const p2 = pts[(i + 1) % pts.length];
                        return new paths.Line(
                            Point.toArray(p1),
                            Point.toArray(p2)
                        );
                    })
                );
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
