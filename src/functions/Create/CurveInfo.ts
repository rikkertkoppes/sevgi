import { Curve } from "@/Core/Geometry/Curve";
import { DISCARD, mapTree, PrimitiveFunction } from "@rkmodules/rules";

export const curveInfo: PrimitiveFunction = {
    name: "curveInfo",
    label: "Curve Info",
    description: "Get information about a curve",
    inputs: {
        curve: "Curve",
    },
    outputs: {
        length: "number",
        boundingbox: "PolyLine",
    },
    impl: async (inputs) => {
        return {
            length: mapTree(inputs.curve || {}, (c?: Curve) => {
                return c?.length || DISCARD;
            }),
            boundingbox: mapTree(inputs.curve || {}, (c?: Curve) => {
                return c?.boundingBox.toRectangle() || DISCARD;
            }),
        };
    },
};
