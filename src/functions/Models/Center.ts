import { PolyLine } from "@/Core/Geometry/PolyLine";
import { mid } from "@/Core/Geometry/Vector";
import { mapTree, PrimitiveFunction } from "@rkmodules/rules";

export const center: PrimitiveFunction = {
    name: "center",
    label: "Center",
    description: "Center of a PolyLine",
    inputs: {
        shape: "PolyLine",
    },
    outputs: {
        point: "Point",
        x: "number",
        y: "number",
    },
    impl: async (inputs) => {
        const point = mapTree(inputs.shape, (m: PolyLine) => {
            const points = m.getPoints();
            const center = mid(...points);

            return center;
        });
        return {
            point,
            x: mapTree(point, (p) => p.x),
            y: mapTree(point, (p) => p.y),
        };
    },
};
