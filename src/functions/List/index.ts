import { PrimitiveFunction } from "@rkmodules/rules";
import { relativeItem } from "./RelativeItem";
import { relativeItems } from "./RelativeItems";

const primitives: Record<string, PrimitiveFunction> = {
    relativeItem,
    relativeItems,
};

export default primitives;
