import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { IPoint, paths } from "makerjs";
import { linesToCells } from "./liensToCells";

export const hexGrid: PrimitiveFunction = {
    name: "hexGrid",
    label: "HexGrid",
    description: "Creates a hexagonal grid",
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

        const nx = params.nx * 3;
        const ny = params.ny * 2 + 1;
        const hSpace = params.width / (nx - 1);
        const vSpace = params.height / (ny - 1);
        for (let j = 0; j < ny; j++) {
            const isLower = j % 2 === 0;
            const isMid = !isLower;
            const pointsInRow = nx - 1 + (j % 2);
            const dx = (1 - (j % 2)) * (hSpace / 2);
            for (let i = 0; i < pointsInRow; i++) {
                const x = i * hSpace + dx;
                const y = j * vSpace;
                points.push([x, y]);
                if (
                    i < pointsInRow - 1 &&
                    ((isLower && i % 3 === 0) || (isMid && i % 3 === 2))
                ) {
                    // horizontal line
                    lines.push(new paths.Line([x, y], [x + hSpace, y]));
                }
                if (isLower && i % 3 === 0 && j < ny - 1) {
                    // backward
                    lines.push(
                        new paths.Line([x, y], [x - hSpace / 2, y + vSpace])
                    );
                }
                if (isLower && i % 3 === 1 && j < ny - 1) {
                    // forward
                    lines.push(
                        new paths.Line([x, y], [x + hSpace / 2, y + vSpace])
                    );
                }
                if (isMid && i % 3 === 0 && j < ny - 1) {
                    // forward
                    lines.push(
                        new paths.Line([x, y], [x + hSpace / 2, y + vSpace])
                    );
                }
                if (isMid && i % 3 === 2 && j < ny - 1) {
                    // backward
                    lines.push(
                        new paths.Line([x, y], [x - hSpace / 2, y + vSpace])
                    );
                }
            }
        }

        const modlels = linesToCells(lines);

        return {
            p: broadCast(points),
            l: broadCast(lines),
            m: broadCast(modlels),
        };
    },
};
