import { Point, v2 } from "./Vector";
import { sum, mult, unit, rot, diff, dot, norm } from "./Vector";
import { fixedNum } from "./Util";

export class LineSegment {
    public length;
    private _tangent;
    private _normal;
    constructor(public start: Point, public end: Point) {
        this.length = norm(diff(start, end));
        this._tangent = unit(diff(end, start));
        this._normal = unit(rot(Math.PI / 2, this.direction()));
    }

    public get line() {
        return Line.fromPoints(this.start, this.end);
    }

    public get bisector() {
        return Line.perpendicularFromPoints(this.start, this.end);
    }

    public direction() {
        return this._tangent;
    }

    public normal() {
        return this._normal;
    }

    public clone() {
        return new LineSegment(this.start, this.end);
    }

    public translate(vector: Point) {
        return new LineSegment(sum(this.start, vector), sum(this.end, vector));
    }
    public rotate(angle: number, center: Point) {
        return new LineSegment(
            rot(angle, this.start, center),
            rot(angle, this.end, center)
        );
    }

    public moveTo(point: Point) {
        return this.translate(diff(point, this.start));
    }

    public split(t: number) {
        const p = this.pointAt(t);
        return [new LineSegment(this.start, p), new LineSegment(p, this.end)];
    }

    public findClosestPoint(p: Point) {
        let t = dot(diff(p, this.start), this.direction()) / this.length;
        t = Math.max(0, Math.min(1, t));
        const pt = this.pointAt(t);
        const d = norm(diff(p, pt));
        return { t, pt, d };
    }

    public offset(d: number) {
        const n = this.normal();
        return new LineSegment(
            sum(this.start, mult(d, n)),
            sum(this.end, mult(d, n))
        );
    }

    public pointAt(t: number) {
        return sum(this.start, mult(t * this.length, this.direction()));
    }
    // eslint-disable-next-line "@typescript-eslint/no-unused-vars"
    public tangentAt(t: number) {
        return this.direction();
    }
    // eslint-disable-next-line "@typescript-eslint/no-unused-vars"
    public normalAt(t: number) {
        return this.normal();
    }
    public offsetAt(t: number, d: number) {
        return sum(this.pointAt(t), mult(d, this.normalAt(t)));
    }
    // eslint-disable-next-line "@typescript-eslint/no-unused-vars"
    public curvatureAt(t: number) {
        return 0;
    }

    public toSVG() {
        const p = this.start;
        let path = fixedNum`M ${p.x} ${p.y}`;
        if (this.length) {
            path += ` ${this.toSVGRel()}`;
        }
        return path;
    }
    public toSVGRel() {
        const p = this.end;
        return fixedNum`L ${p.x} ${p.y}`;
    }
    static is(thing: any): thing is LineSegment {
        return thing instanceof LineSegment;
    }
}

/**
 * lines are represented in 2D by
 *
 *      ax + by = c
 *
 * some special cases:
 *
 *      ax + by = 0     line through origin: y = -(a/b) * x
 *      ax = c          vertical line: x = c/a
 *      by = c          horizontal line: y = c/b
 *
 * when a line is not vertical (b not 0), we can rewrite the equation
 *
 *      y = -(a/b) * x + c / b
 */

export class Line {
    constructor(private a: number, private b: number, private c: number) {}

    public toHesse() {
        const theta = this.angle();
        if (this.a === 0) {
            const m = this.c / this.b;
            return [(theta * 180) / Math.PI, m * Math.sin(theta)];
        } else {
            const n = this.c / this.a;
            return [(theta * 180) / Math.PI, n * Math.cos(theta)];
        }
    }
    public isVertical(): boolean {
        return this.b === 0;
    }
    public isHorizontal(): boolean {
        return this.a === 0;
    }
    public angle(): number {
        return Math.atan2(-this.a, this.b);
    }
    public angleDeg(): number {
        let d = (180 * this.angle()) / Math.PI;
        if (d < -90) d += 180;
        if (d > 90) d -= 180;
        return d;
    }
    public xcrossing(): number | null {
        if (this.a === 0) return null;
        return this.c / this.a;
    }
    public ycrossing(): number | null {
        if (this.b === 0) return null;
        return this.c / this.b;
    }
    public isParallelWith(other: Line): boolean {
        if (this.b === 0 && other.b === 0) return true; //both vertical
        if (this.b === 0 || other.b === 0) return false; // only one vertical
        return this.a / this.b === other.a / other.b;
    }
    public intersectWith(other: Line): Point | null {
        if (!other) return null;
        if (this.isParallelWith(other)) return null;
        const [a, b, c] = [this.a, this.b, this.c];
        const [d, e, f] = [other.a, other.b, other.c];
        return {
            x: (c * e - b * f) / (a * e - b * d),
            y: (a * f - c * d) / (a * e - b * d),
        };
    }

    /** unit vector in the line direction (positive x) */
    public direction() {
        return unit(v2(this.b, -this.a));
    }
    public reverse() {
        return new Line(-this.a, -this.b, -this.c);
    }

    public flipAlong(point: Point, dir: Point) {
        const d = this.direction();
        // transform direction
        const p = mult(dot(d, dir), dir);
        const d2 = diff(mult(2, p), d);
        return Line.fromPointAndDirection(point, d2);
    }

    /**
     * projection of p on the line
     * https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
     */
    public project(p: Point): Point {
        const a = this.a;
        const b = this.b;
        const c = this.c;
        const r = a * a + b * b;
        const x = (b * (b * p.x - a * p.y) + a * c) / r;
        const y = (a * (a * p.y - b * p.x) + b * c) / r;
        return { x, y };
    }

    public distanceToPoint(p: Point): number {
        const a = this.a;
        const b = this.b;
        const c = this.c;
        const r = a * a + b * b;
        return (a * p.x + b * p.y - c) / Math.sqrt(r);
    }

    public pointOn(p: Point): boolean {
        return Math.abs(this.distanceToPoint(p)) < 1e-5;
    }

    /** returns a line segment that is the intersection of the line and the given rect */
    public bounded(
        { x: x1, y: y1 }: Point,
        { x: x2, y: y2 }: Point
    ): LineSegment {
        const t = Line.fromPoints({ x: x1, y: y1 }, { x: x2, y: y1 });
        const r = Line.fromPoints({ x: x2, y: y1 }, { x: x2, y: y2 });
        const b = Line.fromPoints({ x: x1, y: y2 }, { x: x2, y: y2 });
        const l = Line.fromPoints({ x: x1, y: y1 }, { x: x1, y: y2 });
        if (this.isHorizontal()) {
            // guaranteed to exist as l and r are vertical
            const p1 = this.intersectWith(l) as Point;
            const p2 = this.intersectWith(r) as Point;
            return new LineSegment(p1, p2);
        }
        if (this.isVertical()) {
            // guaranteed to exist as t and b are horizontal
            const p1 = this.intersectWith(t) as Point;
            const p2 = this.intersectWith(b) as Point;
            return new LineSegment(p1, p2);
        }
        // guaranteed to exist as line is diagonal
        let p1 = this.intersectWith(t) as Point;
        if (p1.x < x1) p1 = this.intersectWith(l) as Point;
        if (p1.x > x2) p1 = this.intersectWith(r) as Point;
        let p2 = this.intersectWith(b) as Point;
        if (p2.x < x1) p2 = this.intersectWith(l) as Point;
        if (p2.x > x2) p2 = this.intersectWith(r) as Point;
        return new LineSegment(p1, p2);
    }
    public translate({ x, y }: Point): Line {
        return new Line(this.a, this.b, this.c + this.a * x + this.b * y);
    }
    public reflectPoint(p: Point): Point {
        const q = this.project(p);
        return sum(p, mult(-2, diff(p, q)));
    }

    static vertical(x: number): Line {
        return new Line(1, 0, x);
    }
    static horizontal(y: number): Line {
        return new Line(0, 1, y);
    }
    static fromHesse(theta: number, rho: number): Line {
        theta = theta % 360;
        //vertical cases
        if (theta === 0) return new Line(1, 0, rho);
        if (theta === 180) return new Line(1, 0, -rho);
        //horizontal cases
        if (theta === 90) return new Line(0, 1, rho);
        if (theta === 270) return new Line(0, 1, -rho);
        //work in radians for math
        theta = (Math.PI * theta) / 180;
        //through origin
        if (rho === 0) return new Line(1, Math.tan(theta), 0);
        //other cases
        const m = rho / Math.sin(theta);
        const n = rho / Math.cos(theta);
        return new Line(1 / n, 1 / m, 1);
    }
    static fromPointAndDirection(p1: Point, dir: Point) {
        const p2 = sum(p1, dir);
        return this.fromPoints(p1, p2);
    }
    static fromPointAndAngle(p1: Point, angle: number) {
        const dir = rot(angle, v2(1, 0));
        return this.fromPointAndDirection(p1, dir);
    }
    static fromPoints({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point): Line {
        if (x1 !== x2) {
            const sgn = Math.sign(x2 - x1);
            const a = (-1 * sgn * (y1 - y2)) / (x1 - x2);
            const b = sgn * 1;
            const c = a * x1 + b * y1;
            return new Line(a, b, c);
        } else if (y1 !== y2) {
            const sgn = Math.sign(y1 - y2);
            const a = sgn * 1;
            const b = (-1 * sgn * (x1 - x2)) / (y1 - y2);
            const c = a * x1 + b * y1;
            return new Line(a, b, c);
        }
        throw new Error("cannot create line from identical points");
    }

    static perpendicularFromPoints(p1: Point, p2: Point) {
        const mid = mult(0.5, sum(p1, p2));
        const dir = {
            x: -p2.y + p1.y,
            y: p2.x - p1.x,
        };
        return this.fromPointAndDirection(mid, dir);
    }

    static areParallel(line1: Line, line2: Line): boolean {
        return line1.isParallelWith(line2);
    }
    static intersection(line1: Line, line2: Line) {
        return line1.intersectWith(line2);
    }
    static is(thing: any): thing is Line {
        return thing instanceof Line;
    }
}
