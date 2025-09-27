import { PrimitiveFunction } from "@rkmodules/rules";

export const output: PrimitiveFunction = {
    name: "output",
    label: "Output",
    description: "Ouputs Geometry",
    inputs: {
        geometry: { type: "Geometry" },
    },
    outputs: {},
    impl: async (inputs) => {
        return {
            output: inputs.geometry,
        };
    },
};
