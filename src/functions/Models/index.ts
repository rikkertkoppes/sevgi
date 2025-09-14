import { PrimitiveFunction } from "@rkmodules/rules";
import { polygon } from "./Polygon";
import { model } from "./Model";
import { move } from "./Move";
import { scale } from "./Scale";
import { mChains } from "./MChains";
import { mPoints } from "./MPoints";
import { outline } from "./Outline";
import { mPaths } from "./MPaths";

const primitives: Record<string, PrimitiveFunction> = {
    polygon,
    model,
    move,
    scale,
    outline,
    mPoints,
    mChains,
    mPaths,
};

export default primitives;
