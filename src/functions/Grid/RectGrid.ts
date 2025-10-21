import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { v2 } from "@/Core/Geometry/Vector";
import { Rectangle } from "@/Core/Geometry/Rectangle";

export const rectGrid: PrimitiveFunction = {
    name: "rectGrid",
    label: "Square Grid",
    description: "Creates a square grid",
    inputs: {},
    params: {
        size: { type: "number", default: 10 },
        nx: { type: "number", default: 5, min: 1, step: 1 },
        ny: { type: "number", default: 5, min: 1, step: 1 },
    },
    outputs: {
        shapes: "PolyLine",
        lines: "Line",
        points: "Point",
    },
    impl: async (inputs, params) => {
        const nx = params.nx;
        const ny = params.ny;
        const s = params.size;
        const hs = s / 2;
        const hSpace = params.size;
        const vSpace = params.size;
        const shapes = [];
        for (let i = 0; i < nx; i++) {
            for (let j = 0; j < ny; j++) {
                const c = v2(hs + i * hSpace, hs + j * vSpace);
                const r = Rectangle.fromDimensions(c, s, s).makeUnique();
                shapes.push(r);
            }
        }

        const segments = shapes.flatMap((s) => s.getSegments());
        const uniqueSegments = Array.from(
            new Map(segments.map((s) => [s.hash, s])).values()
        );

        const points = uniqueSegments.flatMap((s) => [s.start, s.end]);
        const uniquePoints = Array.from(
            new Map(points.map((p) => [p.hash, p])).values()
        );

        return {
            shapes: broadCast(shapes),
            lines: broadCast(uniqueSegments),
            points: broadCast(uniquePoints),
        };
    },
};
