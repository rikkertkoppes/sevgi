import { PrimitiveFunction } from "@rkmodules/rules";
import { rectGrid } from "./RectGrid";
import { triGrid } from "./TriGrid";
import { hexGrid } from "./HexGrid";

const primitives: Record<string, PrimitiveFunction> = {
    triGrid,
    rectGrid,
    hexGrid,
};

export default primitives;
