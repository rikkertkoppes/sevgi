import { PrimitiveFunction } from "@rkmodules/rules";
import { polygon } from "./Polygon";
import { move } from "./Move";
import { scale } from "./Scale";
import { mPoints } from "./MPoints";
import { outline } from "./Outline";
import { center } from "./Center";
import { countSegments } from "./CountSegments";
import { rotate } from "./Rotate";
import { expolodePoly } from "./ExplodePoly";
import { polyFromPoints } from "./PolyFromPoints";

const primitives: Record<string, PrimitiveFunction> = {
    polygon,
    move,
    rotate,
    scale,
    center,
    outline,
    mPoints,
    countSegments,
    expolodePoly,
    polyFromPoints,
};

export default primitives;
