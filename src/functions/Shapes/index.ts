import { PrimitiveFunction } from "@rkmodules/rules";

import { point } from "./Point";
import { line } from "./Line";
import { circle } from "./Circle";
import { arc } from "./Arc";
import { destructPoint } from "./DestructPoint";

const primitives: Record<string, PrimitiveFunction> = {
    point,
    destructPoint,
    line,
    circle,
    arc,
};

export default primitives;
