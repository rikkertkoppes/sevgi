import { nAryOnTree, PrimitiveFunction } from "@rkmodules/rules";

import { IModel, models } from "makerjs";

export const polygon: PrimitiveFunction = {
    name: "polygon",
    label: "Polygon",
    description: "Creates a polygon",
    inputs: {
        o: "Point",
        n: { type: "number", default: 6 },
        r: { type: "number", default: 10 },
        a: { type: "number", default: 0 },
        or: { type: "boolean", default: false },
    },
    outputs: {
        m: "Model",
    },
    impl: async (inputs) => {
        return {
            m: nAryOnTree(
                [inputs.o, inputs.n, inputs.r, inputs.a, inputs.or],
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
