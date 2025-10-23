import { broadCast, PrimitiveFunction } from "@rkmodules/rules";
import { diff, Point, v2 } from "@/Core/Geometry/Vector";
import { RegularPolygon } from "@/Core/Geometry/RegularPolygon";
import { Transform } from "@/Core/Geometry/Transform";
import { DCEL } from "@/Core/Geometry/GeoData";

const baseOct = RegularPolygon.from(Point.ZERO, 8, 1, Math.PI / 8, false);
const baseQuad = RegularPolygon.from(Point.ZERO, 4, 1, 0, false);
const QPI = Math.PI / 4;

export const g488: PrimitiveFunction = {
    name: "truncatedSquareGrid",
    label: "4.8.8 Grid",
    description:
        "Creates a truncated square grid made up of octagons and squares",
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
        const nx = params.nx;
        const ny = params.ny;
        let s = params.size;
        const rOct = s / 2;
        const rQuad = Math.sqrt(2) * rOct - rOct;
        const shapes: RegularPolygon[] = [];
        const aOct = Math.PI / 8;
        const dcel = new DCEL();
        const halfOffset = v2(rOct, rOct);
        if (f) s += 2 * rQuad;
        for (let i = 0; i < nx; i++) {
            for (let j = 0; j < ny; j++) {
                const v = v2(i * s, j * s);
                const transform = Transform.from(v, aOct, rOct);
                const oct = baseOct.transform(transform).makeUnique();
                dcel.addCell(oct); // store in dcel
                shapes.push(oct);
                if (j > 0 && i > 0) {
                    if (f) {
                        // create oct
                        const vo = diff(v, v2(s / 2, s / 2));
                        const transform = Transform.from(vo, aOct, rOct);
                        const oct = baseOct.transform(transform).makeUnique();
                        dcel.addCell(oct); // store in dcel
                        shapes.push(oct);
                    } else {
                        // create quad
                        const vq = diff(v, halfOffset);
                        const transform = Transform.from(vq, 0, rQuad);
                        const quad = baseQuad.transform(transform).makeUnique();
                        dcel.addCell(quad); // store in dcel
                        shapes.push(quad);
                    }
                }
                if (f && i > 0) {
                    // create quad
                    const vq = diff(v, v2(s / 2, 0));
                    const transform = Transform.from(vq, QPI, rQuad);
                    const quad = baseQuad.transform(transform).makeUnique();
                    dcel.addCell(quad); // store in dcel
                    shapes.push(quad);
                }
                if (f && j > 0) {
                    // create quad
                    const vq = diff(v, v2(0, s / 2));
                    const transform = Transform.from(vq, QPI, rQuad);
                    const quad = baseQuad.transform(transform).makeUnique();
                    dcel.addCell(quad); // store in dcel
                    shapes.push(quad);
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
