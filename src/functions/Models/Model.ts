import { nAryOnTreeBranch, PrimitiveFunction } from "@rkmodules/rules";

export const model: PrimitiveFunction = {
    name: "model",
    label: "Model",
    description: "Creates a model",
    inputs: {
        p: "Path",
        m: "Model",
    },
    outputs: {
        m: "Model",
    },
    impl: async (inputs) => {
        return {
            m: nAryOnTreeBranch(
                [inputs.p || {}, inputs.m || {}],
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
