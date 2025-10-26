import { DISCARD, mapTreeBranch, PrimitiveFunction } from "@rkmodules/rules";

export const relativeItems: PrimitiveFunction = {
    name: "relativeItems",
    label: "Relative Items",
    description:
        "Pairs each item in the tree with an item in another tree at a specified offset",
    inputs: {
        treeA: { type: "any" },
        treeB: { type: "any" },
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
            itemA: inputs.treeA || {},
            itemB: mapTreeBranch(inputs.treeB || {}, (branch) => {
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
