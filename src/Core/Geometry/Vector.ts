import { BaseGeometry, WalkerOptions } from "./BaseGeometry";
import { fixedNum } from "./Util";

/**
 * class wrapper for a point
 */
export class Point extends BaseGeometry {
    public type = "Point";
    constructor(public x: number, public y: number) {
        super();
    }

    public clone(): Point {
        return new Point(this.x, this.y);
    }

    public translate(v: Point): Point {
        return this.copyIdentity(sum(this, v));
    }
    public rotate(angle: number, center: Point): Point {
        return this.copyIdentity(rot(angle, this, center));
    }
    public scale(factor: number, center: Point): Point {
        return this.copyIdentity(sum(mult(factor, diff(this, center)), center));
    }

    public walk({ enter, exit }: WalkerOptions): this {
        let r = this;
        if (enter) {
            r = enter(r) || r;
        }
        if (exit) {
            r = exit(r) || r;
        }
        return r;
    }
    public flatten(): Point[] {
        return [this];
    }

    public toSVG() {
        let path = fixedNum`M ${this.x} ${this.y}`;
        path += " l 0, 0";
        return path;
    }
    public toString(): string {
        return fixedNum`<Point ${this.x}, ${this.y}>`;
    }
    public hash(): string {
        return fixedNum`${this.x},${this.y}`;
    }

    public static is(p: any): p is Point {
        return p && typeof p.x === "number" && typeof p.y === "number";
    }
    public static toArray(p: Point): [number, number] {
        return [p.x, p.y];
    }
}

export const v2 = (x: number, y: number): Point => new Point(x, y);
export const fromArray = ([x, y]: number[]): Point => new Point(x, y);
export const fromPolar = (r: number, angle: number): Point => {
    return v2(r * Math.cos(angle), r * Math.sin(angle));
};

export const snap = ({ x, y }: Point, gridX = 1, gridY = gridX): Point => {
    return v2(gridX * Math.round(x / gridX), gridY * Math.round(y / gridY));
};

/**
 * constrains a point p to be within the box defined by tl and br
 * @param p
 * @param p1
 * @param p2
 */
export const constrain = ({ x, y }: Point, tl: Point, br: Point): Point => {
    return v2(
        Math.min(br.x, Math.max(tl.x, x)),
        Math.min(br.y, Math.max(tl.y, y))
    );
};

export type Transform = [number, number, number, number, number, number];

export const dot = ({ x: ax, y: ay }: Point, { x: bx, y: by }: Point): number =>
    ax * bx + ay * by;
export const cross = (
    { x: ax, y: ay }: Point,
    { x: bx, y: by }: Point
): number => ax * by - ay * bx;

/** length of a vector */
export const norm = (p: Point): number => Math.sqrt(dot(p, p));
/** angle of a vector */
export const angle = ({ x, y }: Point): number => Math.atan2(y, x);
/** absolute value of all components */
export const abs = ({ x, y }: Point): Point => v2(Math.abs(x), Math.abs(y));
/** minumum components of all points */
export const min = (...ps: Point[]): Point => {
    const x = Math.min(...ps.map((p) => p.x));
    const y = Math.min(...ps.map((p) => p.y));
    return v2(x, y);
};
/** maximum components of all points */
export const max = (...ps: Point[]): Point => {
    const x = Math.max(...ps.map((p) => p.x));
    const y = Math.max(...ps.map((p) => p.y));
    return v2(x, y);
};
export const bounded = (p: Point, minp: Point, maxp: Point): Point => {
    return max(minp, min(maxp, p));
};

export const angleBetween = (v1: Point, v2: Point) => {
    return Math.acos(dot(v1, v2) / (norm(v1) * norm(v2)));
};

export const distance = (v1: Point, v2: Point) => {
    return norm(diff(v1, v2));
};

export const sum = (...ps: Point[]) => {
    return ps.reduce((s, p) => {
        return v2(s.x + p.x, s.y + p.y);
    }, v2(0, 0));
};
export const mult = (a: number, { x, y }: Point): Point => v2(a * x, a * y);
/** rotates the vector. positive angles are clockwise in radians */
export const rot = (a: number, p: Point, around?: Point): Point => {
    around = around || v2(0, 0);
    const pc = diff(p, around);
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    return sum(around, v2(pc.x * ca - pc.y * sa, pc.x * sa + pc.y * ca));
};
export const rotateRight = ({ x, y }: Point): Point => {
    return v2(-y, x);
};
export const rotateLeft = ({ x, y }: Point): Point => {
    return v2(y, -x);
};
export const unit = (p: Point): Point => {
    const n = norm(p);
    if (n === 0) return v2(0, 0);
    return mult(1 / norm(p), p);
};
export const diff = (p1: Point, ...ps: Point[]): Point =>
    sum(p1, ...ps.map((p) => mult(-1, p)));
export const same = (p1?: Point | null, p2?: Point | null): boolean => {
    if (!(p1 && p2)) return false;
    return norm(diff(p1, p2)) < 0.0001;
};
export const mid = (...ps: Point[]): Point => {
    if (!ps.length) throw new Error("no points to average");
    return mult(1 / ps.length, sum(...ps));
};
export const lerp = (p1: Point, p2: Point, t: number): Point => {
    return sum(mult(1 - t, p1), mult(t, p2));
};
export const colinear = (p1: Point, p2: Point, p3: Point) => {
    const a = diff(p2, p1);
    const b = diff(p3, p2);
    return Math.abs(cross(a, b)) < 1e-5;
};
export const mirror = (p: Point, axis: "" | "x" | "y" | "xy"): Point => {
    switch (axis) {
        case "x":
            return v2(-p.x, p.y);
        case "y":
            return v2(p.x, -p.y);
        case "xy":
            return v2(-p.x, -p.y);
        default:
            return p;
    }
};

/**
 * matrix transformation
 *
 *  |x|   |a c e| |x|
 *  |y| = |b d f| |y|
 *  |1|   |0 0 1| |1|
 */
export const transform = (
    { x, y }: Point,
    [a, b, c, d, e, f]: number[]
): Point => {
    return v2(a * x + c * y + e, b * x + d * y + f);
};
export const transformDom = (
    { x, y }: Point,
    { a, b, c, d, e, f }: DOMMatrix
): // m: DOMMatrix
Point => {
    // let p = new DOMPoint(x, y);
    // return p.matrixTransform(m);
    return v2(a * x + c * y + e, b * x + d * y + f);
};

export const xfmult = (
    [a1, b1, c1, d1, e1, f1]: Transform,
    [a2, b2, c2, d2, e2, f2]: Transform
): Transform => {
    return [
        a1 * a2 + b1 * c2,
        a1 * b2 + d2 * b1,
        c1 * a2 + d1 * c2,
        c1 * b2 + d1 * d2,
        e1 * a2 + f1 * c2 + e2,
        e1 * b2 + f1 * d2 + f2,
    ];
};
