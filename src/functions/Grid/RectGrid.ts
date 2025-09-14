import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { IPoint, paths } from "makerjs";
import { linesToCells } from "./liensToCells";

export const rectGrid: PrimitiveFunction = {
    name: "rectGrid",
    label: "RectGrid",
    description: "Creates a rectangular grid",
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
        for (let i = 0; i < nx; i++) {
            for (let j = 0; j < ny; j++) {
                points.push([i * hSpace, j * vSpace]);
                if (i < nx - 1) {
                    lines.push(
                        new paths.Line(
                            [i * hSpace, j * vSpace],
                            [(i + 1) * hSpace, j * vSpace]
                        )
                    );
                }
                if (j < ny - 1) {
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
            p: broadCast(points),
            l: broadCast(lines),
            m: broadCast(models),
        };
    },
};
