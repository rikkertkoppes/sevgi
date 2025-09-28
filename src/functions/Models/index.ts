import { PrimitiveFunction } from "@rkmodules/rules";
import { polygon } from "./Polygon";
import { model } from "./Model";
import { move } from "./Move";
import { scale } from "./Scale";
import { mPoints } from "./MPoints";
import { outline } from "./Outline";
import { mPaths } from "./MPaths";
import { center } from "./Center";
import { countSegments } from "./CountSegments";
import { rotate } from "./Rotate";
import { expolodePoly } from "./ExplodePoly";
import { polyFromPoints } from "./PolyFromPoints";

const primitives: Record<string, PrimitiveFunction> = {
    polygon,
    model,
    move,
    rotate,
    scale,
    center,
    outline,
    mPoints,
    mPaths,
    countSegments,
    expolodePoly,
    polyFromPoints,
};

export default primitives;
