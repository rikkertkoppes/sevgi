import { PrimitiveFunction } from "@rkmodules/rules";
import { rectGrid } from "./RectGrid";
import { triGrid } from "./TriGrid";
import { hexGrid } from "./HexGrid";
import { bricks } from "./Bricks";
import { truncatedSquareGrid } from "./TruncatedSquareGrid";
import { spiral } from "./Spiral";

const primitives: Record<string, PrimitiveFunction> = {
    triGrid,
    rectGrid,
    hexGrid,
    truncatedSquareGrid,
    bricks,
    spiral,
};

export default primitives;
