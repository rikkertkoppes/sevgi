import { PrimitiveFunction } from "@rkmodules/rules";

import { point } from "./Point";
import { line } from "./Line";
import { circle } from "./Circle";
import { arc } from "./Arc";

const primitives: Record<string, PrimitiveFunction> = {
    point,
    line,
    circle,
    arc,
};

export default primitives;
