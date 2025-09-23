import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { IPoint, paths } from "makerjs";
import { linesToCells } from "./liensToCells";

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
        points: "Point",
        lines: "Line",
        shapes: "Model",
    },
    impl: async (inputs, params) => {
        const points: IPoint[] = [];
        const lines: paths.Line[] = [];

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
                if ((isMid && i % 3 !== 1) || (isLower && i % 3 !== 2)) {
                    points.push([x, y]);
                }
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

        const models = linesToCells(lines);

        return {
            points: broadCast(points),
            lines: broadCast(lines),
            shapes: broadCast(models),
        };
    },
};
