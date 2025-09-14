import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { IPoint, paths } from "makerjs";
import { linesToCells } from "./liensToCells";

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
        points: "Point",
        lines: "Line",
        cells: "Model",
    },
    impl: async (inputs, params) => {
        const points: IPoint[] = [];
        const lines: paths.Line[] = [];

        const nx = params.nx + 1;
        const ny = params.ny * 2 + 1;
        const hSpace = params.width / (nx - 1);
        const vSpace = params.height / (ny - 1);
        for (let j = 0; j < ny; j++) {
            for (let i = 0; i < nx; i++) {
                points.push([i * hSpace, j * vSpace]);

                if (j % 2 === i % 2 && i < nx - 1) {
                    // horizontal line
                    lines.push(
                        new paths.Line(
                            [i * hSpace, j * vSpace],
                            [(i + 1) * hSpace, j * vSpace]
                        )
                    );
                }
                if (j < ny - 1) {
                    // vertical line
                    lines.push(
                        new paths.Line(
                            [i * hSpace, j * vSpace],
                            [i * hSpace, (j + 1) * vSpace]
                        )
                    );
                }
            }
        }

        const models = linesToCells(lines);

        return {
            points: broadCast(points),
            lines: broadCast(lines),
            cells: broadCast(models),
        };
    },
};
