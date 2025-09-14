import { PrimitiveFunction } from "@rkmodules/rules";
import { rectGrid } from "./RectGrid";
import { triGrid } from "./TriGrid";
import { hexGrid } from "./HexGrid";
import { bricks } from "./Bricks";

const primitives: Record<string, PrimitiveFunction> = {
    triGrid,
    rectGrid,
    hexGrid,
    bricks,
};

export default primitives;
