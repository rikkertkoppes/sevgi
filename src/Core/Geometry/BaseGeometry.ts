import { Point } from "./Vector";

export abstract class BaseGeometry {
    abstract type: string;
    abstract clone(): BaseGeometry;
    abstract translate(v: Point): BaseGeometry;
    abstract rotate(angle: number, center: Point): BaseGeometry;
    abstract scale(factor: number, center: Point): BaseGeometry;

    abstract toString(): string;
    abstract toSVG(): any;
}
