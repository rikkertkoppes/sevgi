import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { IPoint, paths } from "makerjs";
import { linesToCells } from "./liensToCells";

export const triGrid: PrimitiveFunction = {
    name: "triGrid",
    label: "TriGrid",
    description: "Creates a triangular grid",
    inputs: {},
    params: {
        width: { type: "number", default: 100 },
        height: { type: "number", default: 100 },
        nx: { type: "number", default: 5 },
        ny: { type: "number", default: 5 },
    },
    outputs: {
        p: "Point",
        l: "Line",
        m: "Model",
    },
    impl: async (inputs, params) => {
        const points: IPoint[] = [];
        const lines: paths.Line[] = [];

        const nx = params.nx + 1;
        const ny = params.ny + 1;
        const hSpace = params.width / (nx - 1);
        const vSpace = params.height / (ny - 1);
        for (let j = 0; j < ny; j++) {
            const pointsInRow = nx - (j % 2);
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
                    if (i < nx - 1) {
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
            p: broadCast(points),
            l: broadCast(lines),
            m: broadCast(models),
        };
    },
};
