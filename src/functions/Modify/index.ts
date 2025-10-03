import { PrimitiveFunction } from "@rkmodules/rules";
import { move } from "./Move";
import { scale } from "./Scale";
import { countSegments } from "./CountSegments";
import { rotate } from "./Rotate";
import { mergeChanges } from "./MergeChanges";
import { destructPoint } from "./DestructPoint";
import { evaluateCurve } from "./EvaluateCurve";
import { intersections } from "./Intersections";

const primitives: Record<string, PrimitiveFunction> = {
    destructPoint,
    move,
    rotate,
    scale,
    evaluateCurve,
    countSegments,
    intersections,
    mergeChanges,
};

export default primitives;
