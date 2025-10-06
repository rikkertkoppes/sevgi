/**
 * Base class for curves, represents a parametrized curve in 2D space.
 */

import { BaseGeometry } from "./BaseGeometry";
import { Point } from "./Vector";

export interface ClosestPointInfo {
    t: number;
    point: Point;
    distance: number;
}

export abstract class Curve extends BaseGeometry {
    protected closed: boolean = false;
    public get isClosed(): boolean {
        return this.closed;
    }
    abstract length: number;
    abstract pointAt(t: number): Point;
    abstract normalAt(t: number): Point;
    abstract tangentAt(t: number): Point;
    abstract offsetAt(t: number, distance: number): Point;
    abstract curvatureAt(t: number): number;
    abstract findClosestPoint(p: Point): ClosestPointInfo;

    abstract getPoints(): Point[];
}
