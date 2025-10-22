import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { Point, transpose, v2 } from "@/Core/Geometry/Vector";
import { RegularPolygon } from "@/Core/Geometry/RegularPolygon";
import { Transform } from "@/Core/Geometry/Transform";

const baseHex = RegularPolygon.from(Point.ZERO, 6, 1, 0, true);
const HPI = Math.PI / 2;

export const hexGrid: PrimitiveFunction = {
    name: "hexGrid",
    label: "Hexagonal Grid",
    description: "Creates a hexagonal grid",
    inputs: {},
    params: {
        size: { type: "number", default: 10 },
        nx: { type: "number", default: 5 },
        ny: { type: "number", default: 5 },
        flip: { type: "boolean", default: false },
    },
    outputs: {
        shapes: "PolyLine",
        lines: "Line",
        points: "Point",
    },
    impl: async (inputs, params) => {
        const f = params.flip;
        const ny = f ? params.nx : params.ny;
        const nx = f ? params.ny : params.nx;
        const nu = Math.ceil(nx / 2); // upper number
        const nl = Math.floor(nx / 2); // lower number
        const hSpace = params.size * 3;
        const vSpace = params.size * Math.sqrt(3);
        const shapes: RegularPolygon[] = [];
        for (let j = 0; j < ny; j++) {
            const y = j * vSpace;
            for (let i = 0; i < nu; i++) {
                const x = i * hSpace;
                let v = v2(x, y);
                if (params.flip) v = transpose(v);
                const transform = Transform.from(v, f ? HPI : 0, params.size);
                const hex = baseHex.transform(transform).makeUnique();
                shapes.push(hex);
            }
            for (let i = 0; i < nl; i++) {
                const x = i * hSpace + hSpace / 2;
                let v = v2(x, y + vSpace / 2);
                if (params.flip) v = transpose(v);
                const transform = Transform.from(v, f ? HPI : 0, params.size);
                const hex = baseHex.transform(transform).makeUnique();
                shapes.push(hex);
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
