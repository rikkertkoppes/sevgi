import { PrimitiveFunction } from "@rkmodules/rules";
import { move } from "./Move";
import { scale } from "./Scale";
import { countSegments } from "./CountSegments";
import { rotate } from "./Rotate";
import { mergeChanges } from "./MergeChanges";
import { destructPoint } from "./DestructPoint";
import { intersections } from "./Intersections";
import { countPoints } from "./CountPoints";

const primitives: Record<string, PrimitiveFunction> = {
    destructPoint,
    move,
    rotate,
    scale,
    countSegments,
    countPoints,
    intersections,
    mergeChanges,
};

export default primitives;
