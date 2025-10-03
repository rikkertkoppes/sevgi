import { BaseGeometry } from "@/Core/Geometry/BaseGeometry";
import { binaryOnTreeBranch, PrimitiveFunction } from "@rkmodules/rules";

export const mergeChanges: PrimitiveFunction = {
    name: "mergeChanges",
    label: "Merge Changes",
    description: "Merge geometry changes into the given geometry",
    inputs: {
        into: "Geometry",
        changes: "Geometry",
    },
    outputs: {
        geometry: "Geometry",
    },
    impl: async (inputs) => {
        return {
            geometry: binaryOnTreeBranch(
                inputs.into || {},
                inputs.changes || {},
                (intos: BaseGeometry[], changes: BaseGeometry[]) => {
                    // get all the changes
                    const changeIndex = Object.fromEntries(
                        changes
                            .flatMap((c) => c.flatten())
                            .map((c) => [c._id, c])
                    );
                    // console.log("flat changes", changeIndex);
                    return intos.map((into) => {
                        /**
                         * when replacing on enter, in case with a moved line
                         *
                         * - enter -> there is a new line, with new points, so only the line is moved
                         * - exit -> same story
                         *
                         * when the points are moved
                         * - enter ->
                         *
                         */

                        // walk the geometry tree
                        // check all geometry, if ids match with any of the changes, replace it
                        return into.walk({
                            enter: (g) => {
                                if (changeIndex[g._id]) {
                                    // console.log(
                                    //     "enter replacing",
                                    //     g,
                                    //     "with",
                                    //     changeIndex[g._id]
                                    // );
                                    return changeIndex[g._id] as any;
                                }
                                return g;
                            },
                        });
                    });
                }
            ),
        };
    },
};
