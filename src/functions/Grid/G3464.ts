import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { Point, v2 } from "@/Core/Geometry/Vector";
import { Transform } from "@/Core/Geometry/Transform";
import { DCEL } from "@/Core/Geometry/GeoData";
import { RegularPolygon } from "@/Core/Geometry/RegularPolygon";

const baseTri = RegularPolygon.from(Point.ZERO, 3, 1, 0, false);
const baseQuad = RegularPolygon.from(Point.ZERO, 4, 1, 0, false);
const baseHex = RegularPolygon.from(Point.ZERO, 6, 1, 0, false);
const PI = Math.PI;
const HPI = PI / 2;
const TPI = PI / 3;
const QPI = PI / 4;
const sq3 = Math.sqrt(3);

export const g3464: PrimitiveFunction = {
    name: "G3464",
    label: "3.4.6.4 Grid",
    description: "Creates a grid of hexagon, squares and triangles",
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
        const hSpace = params.size * sq3;
        const vSpace = params.size;
        const shapes: RegularPolygon[] = [];
        const s = params.size / (1 + sq3); // side length
        const rHex = (s * sq3) / 2;
        const aHex = TPI / 2;
        const rQuad = params.size / 2 - rHex;
        const aQuad = QPI;
        const rTri = rHex / 3;
        const dcel = new DCEL();
        for (let j = 0; j < ny; j++) {
            const y = j * vSpace;
            for (let i = 0; i < nu; i++) {
                const x = i * hSpace;
                const v = f ? v2(y, x) : v2(x, y);
                const transform = Transform.from(v, f ? aHex : 0, rHex);
                const hex = baseHex.transform(transform).makeUnique();
                dcel.addCell(hex); // store in dcel
                shapes.push(hex);

                // add quads
                if (j > 0) {
                    const vq1 = f
                        ? v2(v.x - vSpace / 2, v.y)
                        : v2(v.x, v.y - vSpace / 2);
                    const tq1 = Transform.from(vq1, aQuad, rQuad);
                    const q1 = baseQuad.transform(tq1).makeUnique();
                    dcel.addCell(q1); // store in dcel
                    shapes.push(q1);
                    if (i > 0) {
                        const vq2 = f
                            ? v2(v.x - vSpace / 4, v.y - hSpace / 4)
                            : v2(v.x - hSpace / 4, v.y - vSpace / 4);
                        const tq2 = Transform.from(
                            vq2,
                            f ? QPI + TPI : QPI - TPI,
                            rQuad
                        );
                        const q2 = baseQuad.transform(tq2).makeUnique();
                        dcel.addCell(q2); // store in dcel
                        shapes.push(q2);
                    }
                }
                if (i > 0) {
                    const vq2 = f
                        ? v2(v.x + vSpace / 4, v.y - hSpace / 4)
                        : v2(v.x - hSpace / 4, v.y + vSpace / 4);
                    const tq2 = Transform.from(
                        vq2,
                        f ? QPI - TPI : QPI + TPI,
                        rQuad
                    );
                    const q2 = baseQuad.transform(tq2).makeUnique();
                    dcel.addCell(q2); // store in dcel
                    shapes.push(q2);
                }
                // add tris
                if (i > 0 && j > 0) {
                    const vt1 = f
                        ? v2(v.x, v.y - hSpace / 3)
                        : v2(v.x - hSpace / 3, v.y);
                    const tt1 = Transform.from(vt1, f ? HPI : 0, rTri);
                    const t1 = baseTri.transform(tt1).makeUnique();
                    dcel.addCell(t1); // store in dcel
                    shapes.push(t1);

                    const vt2 = f
                        ? v2(v.x - vSpace / 2, v.y - hSpace / 6)
                        : v2(v.x - hSpace / 6, v.y - vSpace / 2);
                    const tt2 = Transform.from(vt2, f ? -HPI : PI, rTri);
                    const t2 = baseTri.transform(tt2).makeUnique();
                    dcel.addCell(t2); // store in dcel
                    shapes.push(t2);
                }
            }
            for (let i = 0; i < nl; i++) {
                const x = i * hSpace + hSpace / 2;
                const v = f ? v2(y + vSpace / 2, x) : v2(x, y + vSpace / 2);
                const transform = Transform.from(v, f ? aHex : 0, rHex);
                const hex = baseHex.transform(transform).makeUnique();
                dcel.addCell(hex); // store in dcel
                shapes.push(hex);
                // add quads
                if (j > 0) {
                    const vq1 = f
                        ? v2(v.x - vSpace / 2, v.y)
                        : v2(v.x, v.y - vSpace / 2);
                    const tq1 = Transform.from(vq1, aQuad, rQuad);
                    const q1 = baseQuad.transform(tq1).makeUnique();
                    dcel.addCell(q1); // store in dcel
                    shapes.push(q1);
                }
                const vq2 = f
                    ? v2(v.x - vSpace / 4, v.y - hSpace / 4)
                    : v2(v.x - hSpace / 4, v.y - vSpace / 4);
                const tq2 = Transform.from(
                    vq2,
                    f ? QPI + TPI : QPI - TPI,
                    rQuad
                );
                const q2 = baseQuad.transform(tq2).makeUnique();
                dcel.addCell(q2); // store in dcel
                shapes.push(q2);

                if (j < ny - 1) {
                    const vq2 = f
                        ? v2(v.x + vSpace / 4, v.y - hSpace / 4)
                        : v2(v.x - hSpace / 4, v.y + vSpace / 4);
                    const tq2 = Transform.from(
                        vq2,
                        f ? QPI - TPI : QPI + TPI,
                        rQuad
                    );
                    const q2 = baseQuad.transform(tq2).makeUnique();
                    dcel.addCell(q2); // store in dcel
                    shapes.push(q2);
                }
                // add tris
                if (j < ny - 1) {
                    const vt1 = f
                        ? v2(v.x, v.y - hSpace / 3)
                        : v2(v.x - hSpace / 3, v.y);
                    const tt1 = Transform.from(vt1, f ? HPI : 0, rTri);
                    const t1 = baseTri.transform(tt1).makeUnique();
                    dcel.addCell(t1); // store in dcel
                    shapes.push(t1);
                }
                if (j > 0) {
                    const vt2 = f
                        ? v2(v.x - vSpace / 2, v.y - hSpace / 6)
                        : v2(v.x - hSpace / 6, v.y - vSpace / 2);
                    const tt2 = Transform.from(vt2, f ? -HPI : PI, rTri);
                    const t2 = baseTri.transform(tt2).makeUnique();
                    dcel.addCell(t2); // store in dcel
                    shapes.push(t2);
                }
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
