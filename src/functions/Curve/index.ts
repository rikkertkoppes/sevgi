import { PrimitiveFunction } from "@rkmodules/rules";

import { point } from "./Point";
import { line } from "./Line";
import { circle } from "./Circle";
import { arc } from "./Arc";
import { destructPoint } from "./DestructPoint";
import { midpoint } from "./Midpoint";
import { evaluateCurve } from "./EvaluateCurve";

const primitives: Record<string, PrimitiveFunction> = {
    point,
    destructPoint,
    line,
    circle,
    arc,
    midpoint,
    evaluateCurve,
};

export default primitives;
