import { Circle } from "./Circle";
import { Curve } from "./Curve";
import { fixedNum, normalizeAngle } from "./Util";
import { Point, v2 } from "./Vector";
import { angle, diff, mult, norm, rotateLeft, sum } from "./Vector";

const PI = Math.PI;
const TWO_PI = 2 * PI;

export class Arc extends Curve {
    private zero: boolean; //zero length arc
    private full: boolean; //full circle
    private s: Point;
    private m: Point;
    private e: Point;
    public startAngle: number;
    public endAngle: number;
    private midAngle: number;
    public length: number;

    /**
     * arc, from start to end. if start < end clockwise, otherwise ccw
     * @param c the circle to follow
     * @param start start position in radians, from positive x axis clockwise
     * @param end end position in radians
     */
    constructor(
        public c: Circle,
        private _start: number,
        private _end: number
    ) {
        super();
        this.zero = Math.abs(_start - _end) < 1e-5;
        this.full = Math.abs(Math.abs(_start - _end) - TWO_PI) < 1e-5;
        const start = normalizeAngle(_start);
        const end = normalizeAngle(_end);
        this.startAngle = start;
        this.endAngle = end;
        // calculate start, mid and end points
        let mid = (start + end) / 2;
        if (this.full) {
            mid += PI;
        }
        if ((start < end && c.r < 0) || (start > end && c.r > 0)) {
            mid += PI;
        }
        this.midAngle = mid;
        const r = Math.abs(c.r);
        this.s = sum(c.c, v2(r * Math.cos(start), r * Math.sin(start)));
        this.m = sum(c.c, v2(r * Math.cos(mid), r * Math.sin(mid)));
        this.e = sum(c.c, v2(r * Math.cos(end), r * Math.sin(end)));

        this.length = this.getLength();
    }

    public get start() {
        return this.s;
    }
    public get mid() {
        return this.m;
    }
    public get end() {
        return this.e;
    }
    /** gets the angle of the bend */
    public get angle() {
        return PI - this.length / Math.abs(this.c.r);
    }
    public on(point: Point) {
        if (!this.c.pointOn(point)) {
            return false;
        }
        const p = this.positionOf(point);
        return 0 <= p && p <= 1;
    }

    public getSegmentPoints() {
        return this.c.getSegmentPoints(this.startAngle, this.endAngle);
    }

    /**
     * get the position of a line through the point and the center of the arc
     * 0 is at the start
     * 1 is at the end
     * > 1 is not on the actual arc
     *
     * if the length of the arc is zero, any point on the line yields 0
     * any other point yields POSITIVE_INFINITY
     *
     * if the radius of the arc is zero, it yields like positive radius
     */
    public positionOf(point: Point): number {
        // this makes the math work for zero radius circles as well
        const h = this.c.handedness || 1;
        let e = normalizeAngle(h * (this.endAngle - this.startAngle));
        if (this.full) e += TWO_PI;
        const a = normalizeAngle(angle(diff(point, this.c.c)));
        const na = normalizeAngle(h * (a - this.startAngle));
        if (this.zero) {
            // in this case e is zero
            return na === 0 ? 0 : Number.POSITIVE_INFINITY;
        }
        return na / e;
    }
    /**
     * length of the arc
     */
    private getLength() {
        const end = this.endAngle;
        const start = this.startAngle;
        const r = this.c.r;
        if (this.zero) return 0;
        if (this.full) return Math.abs(TWO_PI * r);
        let d = Math.abs(end - start);
        if ((start < end && r < 0) || (start > end && r > 0)) {
            d = TWO_PI - d;
        }
        return Math.abs(r * d);
    }

    public clone() {
        return new Arc(this.c.clone(), this._start, this._end);
    }

    public translate(vector: Point) {
        return new Arc(this.c.translate(vector), this._start, this._end);
    }
    public rotate(angle: number, center: Point) {
        return new Arc(
            this.c.rotate(angle, center),
            this._start + angle,
            this._end + angle
        );
    }

    public split(t: number) {
        const a = this.angleAt(t);
        const c = this.c.clone();
        if (this.zero) return [this.clone(), this.clone()];
        return [new Arc(c, this.startAngle, a), new Arc(c, a, this.endAngle)];
    }

    public findClosestPoint(p: Point) {
        let t = this.positionOf(p);
        if (t < 0) t = 0;
        if (t > 1) t = 1;
        const point = this.pointAt(t);
        const distance = norm(diff(p, point));
        return { t, point, distance };
    }

    /** offsets the arc */
    public offset(d: number) {
        return new Arc(this.c.offset(d), this._start, this._end);
    }

    public angleAt(t: number) {
        let range = this._end - this._start;
        if (this.c.handedness === -1 && range > 0) {
            range -= TWO_PI;
        }
        if (this.c.handedness === 1 && range < 0) {
            range += TWO_PI;
        }
        return this.startAngle + t * range;
    }
    public pointAt(t: number) {
        const a = this.angleAt(t);
        return this.c.pointAtAngle(a);
    }
    public tangentAt(t: number) {
        const n = this.normalAt(t);
        return rotateLeft(n);
    }
    public normalAt(t: number) {
        // outward normal from circle
        const n = this.c.normalAtPoint(this.pointAt(t));
        // flip if clockwise to point to right of direction of travel
        return mult(-this.c.handedness, n);
    }
    public offsetAt(t: number, d: number) {
        return sum(this.pointAt(t), mult(d, this.normalAt(t)));
    }
    // eslint-disable-next-line "@typescript-eslint/no-unused-vars"
    public curvatureAt(t: number) {
        return 1 / this.c.r;
    }

    public toSVG() {
        const { x, y } = this.s;
        return fixedNum`M ${x} ${y} ${this.toSVGRel()}`;
    }
    public toSVGRel() {
        if (this.zero) return "";
        const r = Math.abs(this.c.r);
        const e = this.e;
        const m = this.m;
        const lf = "0"; //always the small arc, as we devided in two
        const sf = this.c.handedness === 1 ? "1" : "0"; // sweep flag
        return (
            fixedNum`A ${r} ${r} 0 ${lf} ${sf} ${m.x} ${m.y} ` +
            fixedNum`A ${r} ${r} 0 ${lf} ${sf} ${e.x} ${e.y}`
        );
    }

    public toString(): string {
        return `<Arc>`;
    }

    static is(thing: any): thing is Arc {
        return thing instanceof Arc;
    }
}
