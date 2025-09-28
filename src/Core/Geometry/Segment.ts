import { Curve } from "./Curve";
import { Point } from "./Vector";

export abstract class Segment extends Curve {
    abstract clone(): Segment;
    abstract translate(v: Point): Segment;
    abstract rotate(angle: number, center: Point): Segment;
    abstract scale(factor: number, center: Point): Segment;

    abstract start: Point;
    abstract end: Point;
    abstract offset(d: number): Segment;

    abstract intersectWith(other: Segment): Point[];

    abstract toSVGRel(): string;
}
