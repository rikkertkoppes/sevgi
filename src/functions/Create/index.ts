import { PrimitiveFunction } from "@rkmodules/rules";

import { point } from "./Point";
import { line } from "./Line";
import { circle } from "./Circle";
import { arc } from "./Arc";
import { midpoint } from "./Midpoint";
import { polygon } from "./Polygon";
import { pointsFromPoly } from "./PointsFromPoly";
import { outline } from "./Outline";
import { expolodePoly } from "./ExplodePoly";
import { polyFromPoints } from "./PolyFromPoints";
import { center } from "./Center";
import { star } from "./Star";

const primitives: Record<string, PrimitiveFunction> = {
    point,
    line,
    circle,
    arc,
    midpoint,
    center,
    polygon,
    pointsFromPoly,
    outline,
    expolodePoly,
    polyFromPoints,
    star,
};

export default primitives;
