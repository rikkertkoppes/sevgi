import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { IPoint } from "makerjs";

const phi = (1 + Math.sqrt(5)) / 2;

export const spiral: PrimitiveFunction = {
    name: "spiral",
    label: "Spiral",
    description: "Points on a spiral",
    inputs: {},
    params: {
        count: { type: "number", default: 10 },
        dr: { type: "number", default: 1 },
        da: { type: "number", default: 360 / phi },
    },
    outputs: {
        points: "Point",
        polars: "Point",
    },
    impl: async (inputs, params) => {
        const points: IPoint[] = [];
        const polars: IPoint[] = [];

        const n = params.count;
        for (let j = 1; j < n; j++) {
            const r = params.dr * j;
            const a = (params.da * j * Math.PI) / 180;
            const x = r * Math.cos(a);
            const y = r * Math.sin(a);
            polars.push([r, a]);
            points.push([x, y]);
        }

        return {
            points: broadCast(points),
            polars: broadCast(polars),
        };
    },
};
