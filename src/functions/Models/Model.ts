import { nAryOnTreeBranch, PrimitiveFunction } from "@rkmodules/rules";

export const model: PrimitiveFunction = {
    name: "model",
    label: "Model",
    description: "Creates a model",
    inputs: {
        paths: "Path",
        shapes: "Model",
    },
    outputs: {
        shapes: "Model",
    },
    impl: async (inputs) => {
        return {
            shapes: nAryOnTreeBranch(
                [inputs.paths || {}, inputs.shapes || {}],
                ([p = [], m = []]) => {
                    return [
                        {
                            paths: Object.fromEntries(
                                p.map((p: any, i: number) => [`p${i}`, p])
                            ),
                            models: Object.fromEntries(
                                m.map((m: any, i: number) => [`m${i}`, m])
                            ),
                        },
                    ];
                }
            ),
        };
    },
};
