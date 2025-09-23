import { mapTreeBranch, PrimitiveFunction } from "@rkmodules/rules";
import { IModel, paths, angle, model } from "makerjs";
import { linesToCells } from "./liensToCells";
import { fromArray, Point } from "@/Core/Geometry/Vector";
import { Line, LineSegment } from "@/Core/Geometry/Line";

export const star: PrimitiveFunction = {
    name: "star",
    label: "Star Pattern",
    description: "Creates star pattern in a cell",
    inputs: {
        cell: { type: "Model" },
    },
    params: {
        angle: { type: "number", default: 40 },
        distance: { type: "number", default: 0 },
    },
    outputs: {
        lines: "Line",
        cells: "Model",
    },
    impl: async (inputs, params) => {
        const lines = mapTreeBranch(inputs.cell, (branch: IModel[]) => {
            const trimmed: paths.Line[] = [];
            branch.forEach((c) => {
                const lines: paths.Line[] = [];
                model.walk(c, {
                    onPath: (p) => {
                        if (p.pathContext.type === "line") {
                            lines.push(p.pathContext as paths.Line);
                        }
                    },
                });

                const centers = lines.map((l) => [
                    (l.origin[0] + l.end[0]) / 2,
                    (l.origin[1] + l.end[1]) / 2,
                ]);
                const mid = centers.reduce(
                    (acc, p) => [
                        acc[0] + p[0] / centers.length,
                        acc[1] + p[1] / centers.length,
                    ],
                    [0, 0]
                );

                const newLines: LineSegment[] = [];
                const length = 10;

                centers.forEach((c) => {
                    const refLine = new LineSegment(
                        fromArray(c),
                        fromArray(mid)
                    );
                    const refAngle = angle.toDegrees(refLine.line.angle());

                    // const refLine = lines[i];
                    // const refAngle = angle.ofLineInDegrees(refLine);
                    const a1 = angle.toRadians(refAngle + params.angle);
                    const a2 = angle.toRadians(refAngle - params.angle);
                    const v1 = [
                        c[0] + Math.cos(a1) * (length + params.distance),
                        c[1] + Math.sin(a1) * (length + params.distance),
                    ];
                    const v2 = [
                        c[0] + Math.cos(a2) * (length + params.distance),
                        c[1] + Math.sin(a2) * (length + params.distance),
                    ];

                    const lin = new LineSegment(fromArray(v1), fromArray(c));
                    const lout = new LineSegment(fromArray(c), fromArray(v2));
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
                            trimmed.push(
                                new paths.Line(
                                    Point.toArray(inter),
                                    Point.toArray(l.end)
                                )
                            );
                        } else {
                            trimmed.push(
                                new paths.Line(
                                    Point.toArray(l.start),
                                    Point.toArray(inter)
                                )
                            );
                        }
                    }
                });
            });

            return trimmed;
        });

        const cells = mapTreeBranch(lines, (lines: paths.Line[]) => {
            return linesToCells(lines);
        });

        return {
            lines,
            cells,
        };
    },
};
