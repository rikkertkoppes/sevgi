import {
    mapTreeBranch,
    nAryOnTreeBranch,
    PrimitiveFunction,
} from "@rkmodules/rules";
import { linesToCells } from "./linesToCells";
import { mid, lerp } from "@/Core/Geometry/Vector";
import { LineSegment } from "@/Core/Geometry/Line";
import { PolyLine } from "@/Core/Geometry/PolyLine";

export const star: PrimitiveFunction = {
    name: "star",
    label: "Star Pattern",
    description: "Creates star pattern in a cell",
    inputs: {
        shape: { type: "PolyLine" },
        factor: { type: "number", default: 0.5 },
        distance: { type: "number", default: 0 },
    },
    params: {},
    outputs: {
        shapes: "PolyLine",
        lines: "Line",
    },
    impl: async (inputs) => {
        const lines = nAryOnTreeBranch(
            [inputs.shape || {}, inputs.factor, inputs.distance],
            (branches) => {
                const lines: LineSegment[] = [];
                const polies = branches[0] as PolyLine[];
                const factors = branches[1] as number[];
                const distances = branches[2] as number[];
                polies.forEach((c, i) => {
                    const factor = factors[Math.min(i, factors.length - 1)];
                    const distance =
                        distances[Math.min(i, distances.length - 1)];
                    const segments = c.getSegments();

                    const centers = segments.map((l) => mid(l.start, l.end));
                    const midpoint = mid(...centers);

                    centers.forEach((c, i) => {
                        const l = segments[i];
                        // the points on the edge
                        const a1 = lerp(c, l.end, distance);
                        const a2 = lerp(c, l.start, distance);
                        // the points on the lines from the corners to the center
                        const b1 = lerp(l.start, midpoint, factor);
                        const b2 = lerp(l.end, midpoint, factor);
                        // first into the edge, second away from the edge
                        const lin = new LineSegment(b1, a1);
                        const lout = new LineSegment(a2, b2);

                        lines.push(lin, lout);
                    });
                });

                return lines;
            }
        );

        const shapes = mapTreeBranch(lines, (lines: LineSegment[]) => {
            return linesToCells(lines);
        });

        return {
            shapes,
            lines,
        };
    },
};
