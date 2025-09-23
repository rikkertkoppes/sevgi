import { PrimitiveFunction } from "@rkmodules/rules";
import { rectGrid } from "./RectGrid";
import { triGrid } from "./TriGrid";
import { hexGrid } from "./HexGrid";
import { bricks } from "./Bricks";
import { star } from "./Star";
import { truncatedSquareGrid } from "./TruncatedSquareGrid";
import { spiral } from "./Spiral";

const primitives: Record<string, PrimitiveFunction> = {
    triGrid,
    rectGrid,
    hexGrid,
    truncatedSquareGrid,
    bricks,
    star,
    spiral,
};

export default primitives;
