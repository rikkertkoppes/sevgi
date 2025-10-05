import { cross, Point, same } from "./Vector";
import { sum, mult, unit, rot, diff, dot, norm } from "./Vector";
import { fixedNum } from "./Util";
import { Segment } from "./Segment";
import { Arc } from "./Arc";
import { BaseGeometry, WalkerOptions } from "./BaseGeometry";
import { Line } from "./Line";

export class LineSegment extends Segment {
    public type = "LineSegment";
    private _tangent;
    private _normal;
    constructor(public start: Point, public end: Point) {
        super();
        this._tangent = unit(diff(end, start));
        this._normal = unit(rot(-Math.PI / 2, this.direction()));
    }

    public get length() {
        return norm(diff(this.start, this.end));
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
        return this.copyIdentity(
            new LineSegment(
                this.start.translate(vector),
                this.end.translate(vector)
            )
        );
    }
    public rotate(angle: number, center: Point) {
        return this.copyIdentity(
            new LineSegment(
                this.start.rotate(angle, center),
                this.end.rotate(angle, center)
            )
        );
    }
    public scale(factor: number, center: Point) {
        return this.copyIdentity(
            new LineSegment(
                this.start.scale(factor, center),
                this.end.scale(factor, center)
            )
        );
    }

    public moveTo(point: Point) {
        return this.copyIdentity(this.translate(diff(point, this.start)));
    }

    public split(t: number) {
        const p = this.pointAt(t);
        return [new LineSegment(this.start, p), new LineSegment(p, this.end)];
    }

    public findClosestPoint(p: Point) {
        let t = dot(diff(p, this.start), this.direction()) / this.length;
        t = Math.max(0, Math.min(1, t));
        const point = this.pointAt(t);
        const distance = norm(diff(p, point));
        return { t, point, distance };
    }

    public offset(d: number) {
        const n = this.normal();
        return new LineSegment(
            sum(this.start, mult(d, n)),
            sum(this.end, mult(d, n))
        );
    }

    public pointAt(t: number) {
        t = Math.max(0, Math.min(1, t));
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

    // checks if the point is on the line segment
    public pointOn(p: Point): boolean {
        const { point } = this.findClosestPoint(p);
        return same(point, p);
    }

    private intersectWithLine(other: LineSegment): Point[] {
        const eps: number = 1e-9;
        const r = diff(this.end, this.start); // direction vector of this segment
        const s = diff(other.end, other.start); // direction vector of other segment

        const rxs = cross(r, s);
        const q_p = diff(other.start, this.start);

        if (Math.abs(rxs) < eps) {
            // Parallel or collinear
            return [];
        }

        const t = cross(q_p, s) / rxs;
        const u = cross(q_p, r) / rxs;

        if (t >= -eps && t <= 1 + eps && u >= -eps && u <= 1 + eps) {
            // Intersection point lies within both segments
            return [sum(this.start, mult(t, r))];
        }

        return [];
    }

    private intersectWithArc(other: Arc): Point[] {
        // find intersection with line and circle
        const c = other.c;
        const line = this.line;
        const points = c.intersectWithLine(line);
        // filter out the ones that are not on the segment and arc
        return points.filter((p) => this.pointOn(p) && other.pointOn(p));
        // To be implemented
        return [];
    }

    public intersectWith(other: Segment): Point[] {
        if (LineSegment.is(other)) {
            return this.intersectWithLine(other);
        } else if (Arc.is(other)) {
            return this.intersectWithArc(other);
        }
        // segments are either arcs or lines, so no intersection possible
        return [];
    }

    public getPoints() {
        return [this.start, this.end];
    }

    public walk({ enter, exit }: WalkerOptions): this {
        let r = this;
        if (enter) {
            r = enter(r) || r;
        }
        const newStart = r.start.walk({ enter, exit });
        const newEnd = r.end.walk({ enter, exit });
        if (newStart !== r.start || newEnd !== r.end) {
            r = this.copyIdentity(new LineSegment(newStart, newEnd)) as this;
        }
        if (exit) {
            r = exit(r) || r;
        }
        return r;
    }
    public flatten(): BaseGeometry[] {
        return [this, ...this.start.flatten(), ...this.end.flatten()];
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

    public toString(): string {
        return `<LineSegment>`;
    }

    static is(thing: any): thing is LineSegment {
        return thing instanceof LineSegment;
    }

    public static intersection(a: LineSegment, b: LineSegment): Point[] {
        return a.intersectWith(b);
    }
}
