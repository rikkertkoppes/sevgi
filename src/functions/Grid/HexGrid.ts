import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { Point, v2 } from "@/Core/Geometry/Vector";
import { RegularPolygon } from "@/Core/Geometry/RegularPolygon";
import { Transform } from "@/Core/Geometry/Transform";
import { DCEL } from "@/Core/Geometry/GeoData";

const baseHex = RegularPolygon.from(Point.ZERO, 6, 1, 0, false);
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
        const hSpace = params.size * Math.sqrt(3);
        const vSpace = params.size;
        const shapes: RegularPolygon[] = [];
        const rHex = params.size / 2;
        const dcel = new DCEL();
        for (let j = 0; j < ny; j++) {
            const y = j * vSpace;
            for (let i = 0; i < nu; i++) {
                const x = i * hSpace;
                const v = f ? v2(y, x) : v2(x, y);
                const transform = Transform.from(v, f ? HPI : 0, rHex);
                const hex = baseHex.transform(transform).makeUnique();
                dcel.addCell(hex); // store in dcel
                shapes.push(hex);
            }
            for (let i = 0; i < nl; i++) {
                const x = i * hSpace + hSpace / 2;
                const v = f ? v2(y + vSpace / 2, x) : v2(x, y + vSpace / 2);
                const transform = Transform.from(v, f ? HPI : 0, rHex);
                const hex = baseHex.transform(transform).makeUnique();
                dcel.addCell(hex); // store in dcel
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
