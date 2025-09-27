import { mapTreeBranch, PrimitiveFunction } from "@rkmodules/rules";
import { linesToCells } from "./linesToCells";
import { mid, sum, fromPolar } from "@/Core/Geometry/Vector";
import { Line, LineSegment } from "@/Core/Geometry/Line";
import { PolyLine } from "@/Core/Geometry/PolyLine";
import { toDegrees, toRadians } from "@/Core/Geometry/Util";

export const star: PrimitiveFunction = {
    name: "star",
    label: "Star Pattern",
    description: "Creates star pattern in a cell",
    inputs: {
        shape: { type: "PolyLine" },
    },
    params: {
        angle: { type: "number", default: 40 },
        distance: { type: "number", default: 0 },
    },
    outputs: {
        lines: "Line",
        shapes: "PolyLine",
    },
    impl: async (inputs, params) => {
        // TODO: make angle and distance inputs to they can be varied
        // use nAryOnTreeBranch instead
        const lines = mapTreeBranch(inputs.shape, (branch: PolyLine[]) => {
            const trimmed: LineSegment[] = [];
            branch.forEach((c) => {
                const lines = c.getEdges();

                const centers = lines.map((l) => mid(l.start, l.end));
                const midpoint = mid(...centers);

                const newLines: LineSegment[] = [];
                const length = 10;

                centers.forEach((c) => {
                    const refLine = new LineSegment(c, midpoint);
                    const refAngle = toDegrees(refLine.line.angle());

                    // const refLine = lines[i];
                    // const refAngle = angle.ofLineInDegrees(refLine);
                    const r = length + params.distance;
                    const a1 = toRadians(refAngle + params.angle);
                    const a2 = toRadians(refAngle - params.angle);
                    const vx1 = sum(c, fromPolar(r, a1));
                    const vx2 = sum(c, fromPolar(r, a2));

                    const lin = new LineSegment(vx1, c);
                    const lout = new LineSegment(c, vx2);
                    newLines.push(lin, lout);
                });

                // rotate
                const first = newLines.shift();
                newLines.push(first!);

                // console.log(newLines);

                // trim lines
                newLines.forEach((l, i) => {
                    const other = i % 2 ? newLines[i - 1] : newLines[i + 1];
                    const inter = Line.intersection(l.line, other.line);
                    // console.log(l, other, inter);
                    if (inter) {
                        if (i % 2) {
                            // odd -> in
                            trimmed.push(new LineSegment(inter, l.end));
                        } else {
                            trimmed.push(new LineSegment(l.start, inter));
                        }
                    }
                });
            });

            return trimmed;
        });

        const shapes = mapTreeBranch(lines, (lines: LineSegment[]) => {
            return linesToCells(lines);
        });

        return {
            lines,
            shapes,
        };
    },
};
