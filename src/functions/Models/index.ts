import { PrimitiveFunction } from "@rkmodules/rules";
import { polygon } from "./Polygon";
import { model } from "./Model";
import { move } from "./Move";
import { scale } from "./Scale";
import { mChains } from "./MChains";
import { mPoints } from "./MPoints";
import { outline } from "./Outline";
import { mPaths } from "./MPaths";
import { center } from "./Center";
import { countSegments } from "./CountSegments";
import { rotate } from "./Rotate";

const primitives: Record<string, PrimitiveFunction> = {
    polygon,
    model,
    move,
    rotate,
    scale,
    center,
    outline,
    mPoints,
    mChains,
    mPaths,
    countSegments,
};

export default primitives;
