import { PrimitiveFunction } from "@rkmodules/rules";
import { rectGrid } from "./RectGrid";
import { triGrid } from "./TriGrid";
import { hexGrid } from "./HexGrid";
import { bricks } from "./Bricks";
import { spiral } from "./Spiral";
import { g488 } from "./G488";
import { g31212 } from "./G31212";
import { g3464 } from "./G3464";

const primitives: Record<string, PrimitiveFunction> = {
    triGrid,
    rectGrid,
    hexGrid,
    g488,
    g31212,
    g3464,
    bricks,
    spiral,
};

export default primitives;
