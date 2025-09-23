import { nAryOnTree, PrimitiveFunction } from "@rkmodules/rules";

import { IModel, models } from "makerjs";

export const polygon: PrimitiveFunction = {
    name: "polygon",
    label: "Polygon",
    description: "Creates a polygon",
    inputs: {
        center: { type: "Point", default: [[0, 0]] },
        sides: { type: "number", default: 6 },
        radius: { type: "number", default: 10 },
        angle: { type: "number", default: 0 },
        useOuter: { type: "boolean", default: false },
    },
    outputs: {
        shape: "Model",
    },
    impl: async (inputs) => {
        return {
            shape: nAryOnTree(
                [
                    inputs.center,
                    inputs.sides,
                    inputs.radius,
                    inputs.angle,
                    inputs.useOuter,
                ],
                ([o, n, r, a, or]) => {
                    const m: IModel = new models.Polygon(n, r, a, or);
                    if (o) {
                        m.origin = o;
                    }
                    return m;
                },
                true
            ),
        };
    },
};
