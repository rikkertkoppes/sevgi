import { DISCARD, mapTreeBranch, PrimitiveFunction } from "@rkmodules/rules";

export const relativeItem: PrimitiveFunction = {
    name: "relativeItem",
    label: "Relative Item",
    description: "Pairs each item in the tree with its next item",
    inputs: {
        tree: { type: "any" },
    },
    params: {
        offset: { type: "number", default: 1 },
        wrap: { type: "boolean", default: true },
    },
    outputs: {
        itemA: "any",
        itemB: "any",
    },
    impl: async (inputs, params) => {
        return {
            itemA: inputs.tree || {},
            itemB: mapTreeBranch(inputs.tree || {}, (branch) => {
                let mapped = branch.map((_, i) => {
                    const offset = params.offset || 1;
                    let index = i + offset;
                    if (params.wrap) {
                        index = index % branch.length;
                        if (index < 0) index += branch.length;
                    }
                    return branch[index] || DISCARD;
                });
                return mapped.filter((v) => v !== DISCARD);
            }),
        };
    },
};
