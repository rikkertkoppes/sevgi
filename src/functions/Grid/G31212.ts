import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { Point, v2 } from "@/Core/Geometry/Vector";
import { Transform } from "@/Core/Geometry/Transform";
import { DCEL } from "@/Core/Geometry/GeoData";
import { RegularPolygon } from "@/Core/Geometry/RegularPolygon";

const baseTri = RegularPolygon.from(Point.ZERO, 3, 1, 0, false);
const baseDodeca = RegularPolygon.from(Point.ZERO, 12, 1, 0, false);
const PI = Math.PI;
const HPI = PI / 2;
const sq3 = Math.sqrt(3);

export const g31212: PrimitiveFunction = {
    name: "G31212",
    label: "3.12.12 Grid",
    description: "Creates a grid of 12-gons and triangles",
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
        const ny = f ? params.nx : params.ny;
        const nx = f ? params.ny : params.nx;
        const nu = Math.ceil(nx / 2); // upper number
        const nl = Math.floor(nx / 2); // lower number
        const hSpace = params.size * Math.sqrt(3);
        const vSpace = params.size;
        const shapes: RegularPolygon[] = [];
        const rDod = params.size / 2;
        const aDod = Math.PI / 12;
        const edgeLength = 2 * rDod * Math.tan(Math.PI / 12); // dodecahedron edge length
        const rTri = edgeLength / (2 * sq3); // triangle inner radius
        const dcel = new DCEL();
        for (let j = 0; j < ny; j++) {
            const y = j * vSpace;
            for (let i = 0; i < nu; i++) {
                const x = i * hSpace;
                const v = f ? v2(y, x) : v2(x, y);
                const transform = Transform.from(v, aDod, rDod);
                const dod = baseDodeca.transform(transform).makeUnique();
                dcel.addCell(dod); // store in dcel
                shapes.push(dod);

                if (i > 0) {
                    // create triangles
                    const vt1 = f
                        ? v2(v.x, v.y - hSpace / 3)
                        : v2(v.x - hSpace / 3, v.y);
                    const tt1 = Transform.from(vt1, f ? -HPI : PI, rTri);
                    const t1 = baseTri.transform(tt1).makeUnique();
                    dcel.addCell(t1); // store in dcel
                    shapes.push(t1);
                    const vt2 = f
                        ? v2(v.x + vSpace / 2, v.y - hSpace / 6)
                        : v2(v.x - hSpace / 6, v.y + vSpace / 2);
                    const tt2 = Transform.from(vt2, f ? HPI : 0, rTri);
                    const t2 = baseTri.transform(tt2).makeUnique();
                    dcel.addCell(t2); // store in dcel
                    shapes.push(t2);
                }
            }
            for (let i = 0; i < nl; i++) {
                const x = i * hSpace + hSpace / 2;
                const v = f ? v2(y + vSpace / 2, x) : v2(x, y + vSpace / 2);
                const transform = Transform.from(v, aDod, rDod);
                const dod = baseDodeca.transform(transform).makeUnique();
                dcel.addCell(dod); // store in dcel
                shapes.push(dod);

                // create triangles
                const vt1 = f
                    ? v2(v.x, v.y - hSpace / 3)
                    : v2(v.x - hSpace / 3, v.y);
                const tt1 = Transform.from(vt1, f ? -HPI : PI, rTri);
                const t1 = baseTri.transform(tt1).makeUnique();
                dcel.addCell(t1); // store in dcel
                shapes.push(t1);

                const vt2 = f
                    ? v2(v.x - vSpace / 2, v.y - hSpace / 6)
                    : v2(v.x - hSpace / 6, v.y - vSpace / 2);
                const tt2 = Transform.from(vt2, f ? HPI : 0, rTri);
                const t2 = baseTri.transform(tt2).makeUnique();
                dcel.addCell(t2); // store in dcel
                shapes.push(t2);
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
