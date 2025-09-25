import { mapTree, PrimitiveFunction } from "@rkmodules/rules";

import { paths, IPath } from "makerjs";

export const midpoint: PrimitiveFunction = {
    name: "midpoint",
    label: "Midpoint",
    description: "Returns the midpoint of a line or arc",
    inputs: {
        path: { type: "Path" },
    },
    outputs: {
        point: "Point",
    },
    impl: async (inputs) => {
        return {
            point: mapTree(inputs.path, (p: IPath) => {
                if (p.type === "arc") {
                    const a = p as paths.Arc;
                    const midAngle = (a.startAngle + a.endAngle) / 2;
                    const radians = (midAngle * Math.PI) / 180;
                    const x = a.origin[0] + a.radius * Math.cos(radians);
                    const y = a.origin[1] + a.radius * Math.sin(radians);
                    return [[x, y]];
                } else if (p.type === "line") {
                    const l = p as paths.Line;
                    return [
                        [
                            (l.origin[0] + l.end[0]) / 2,
                            (l.origin[1] + l.end[1]) / 2,
                        ],
                    ];
                }
            }),
        };
    },
};
