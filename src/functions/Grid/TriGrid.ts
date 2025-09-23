import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { IPoint, paths } from "makerjs";
import { linesToCells } from "./liensToCells";

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
        points: "Point",
        lines: "Line",
        shapes: "Model",
    },
    impl: async (inputs, params) => {
        const points: IPoint[] = [];
        const lines: paths.Line[] = [];

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
                points.push([x, y]);
                if (i < pointsInRow - 1) {
                    // horizontal line
                    lines.push(new paths.Line([x, y], [x + hSpace, y]));
                }
                if (j < ny - 1) {
                    if (j % 2 === 1 || i > 0) {
                        // backward tilted
                        lines.push(
                            new paths.Line([x, y], [x - hSpace / 2, y + vSpace])
                        );
                    }
                    if (i < nx - 1 || (j % 2 === 0 && params.nx % 2 === 0)) {
                        // forward tilted
                        lines.push(
                            new paths.Line([x, y], [x + hSpace / 2, y + vSpace])
                        );
                    }
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
