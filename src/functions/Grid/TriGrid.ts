import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { LineSegment } from "@/Core/Geometry/LineSegment";
import { Point, v2 } from "@/Core/Geometry/Vector";
import { PolyLine } from "@/Core/Geometry/PolyLine";
import { Transform } from "@/Core/Geometry/Transform";
import { DCEL } from "@/Core/Geometry/GeoData";

const top = v2(0.5, Math.sqrt(3) / 2);
const horizontal = new LineSegment(Point.ZERO, Point.UNIT_X);
const backward = new LineSegment(Point.UNIT_X, top);
const forward = new LineSegment(top, Point.ZERO);
const baseTri = PolyLine.from([horizontal, backward, forward]);
const PI = Math.PI;
const HPI = PI / 2;

export const triGrid: PrimitiveFunction = {
    name: "triGrid",
    label: "Triangular Grid",
    description: "Creates a triangular grid",
    inputs: {},
    params: {
        size: { type: "number", default: 10 },
        nx: { type: "number", default: 5, min: 1, step: 1 },
        ny: { type: "number", default: 5, min: 1, step: 1 },
        flip: { type: "boolean", default: false },
    },
    outputs: {
        shapes: "PolyLine",
        lines: "Line",
        points: "Point",
    },
    impl: async (inputs, params) => {
        // nx side by side, counting ups and downs
        // next row is vertically inverted
        // ny rows
        const f = params.flip;
        const nx = f ? params.ny : params.nx;
        const ny = f ? params.nx : params.ny;
        const nu = Math.ceil(nx / 2); // upper number
        const nl = Math.floor(nx / 2); // lower number
        const hSpace = params.size;
        const vSpace = params.size * (Math.sqrt(3) / 2);
        const shapes: PolyLine[] = [];
        const dcel = new DCEL();
        for (let j = 0; j < ny; j++) {
            const oddRow = j % 2 === 1;
            const nUp = oddRow ? nl : nu;
            const nDown = oddRow ? nu : nl;
            const y = j * vSpace;
            for (let i = 0; i < nUp; i++) {
                // pointing up / right
                const x = i * hSpace + (j % 2) * (hSpace / 2);
                const v = f ? v2(y, x + hSpace) : v2(x, y);
                const transform = Transform.from(v, f ? -HPI : 0, params.size);
                const tri = baseTri.transform(transform).makeUnique();
                dcel.addCell(tri); // store in dcel
                shapes.push(tri);
            }
            for (let i = 0; i < nDown; i++) {
                // pointing down / left
                const x = (i + 1) * hSpace + (1 - (j % 2)) * (hSpace / 2);
                const v = f ? v2(y + vSpace, x - hSpace) : v2(x, y + vSpace);
                const transform = Transform.from(v, f ? HPI : PI, params.size);
                const tri = baseTri.transform(transform).makeUnique();
                dcel.addCell(tri); // store in dcel
                shapes.push(tri);
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
