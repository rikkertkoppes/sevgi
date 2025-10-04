import { Point, v2 } from "./Vector";
import {
    angle,
    cross,
    diff,
    distance,
    dot,
    mid,
    mult,
    norm,
    rot,
    rotateLeft,
    rotateRight,
    same,
    sum,
    unit,
} from "./Vector";
import { Line } from "./Line";
import { LineSegment } from "./LineSegment";
import { normalizeAngle, TAU } from "./Util";
import { Curve } from "./Curve";
import { BaseGeometry, WalkerOptions } from "./BaseGeometry";

/** signed circle, negative radii are counter clockwise */
export class Circle extends Curve {
    public type = "Circle";
    public length: number;
    constructor(public c: Point, public r: number) {
        super();
        this.length = Math.abs(r) * TAU;
    }

    get clockwise() {
        return this.r > 0;
    }
    get counterClockwise() {
        return this.r < 0;
    }
    /**
     * 1 for clockwise
     * -1 for counter clockwise
     * 0 for point circles (radius = 0)
     */
    public get handedness() {
        return Math.sign(this.r);
    }

    public pointAt(t: number): Point {
        return this.pointAtAngle(t * TAU);
    }
    public tangentAt(t: number): Point {
        const pt = this.pointAt(t);
        const dir = this.directionAtPoint(pt);
        return mult(Math.sign(this.r), dir);
    }
    public normalAt(t: number): Point {
        return this.normalAtPoint(this.pointAt(t));
    }
    public offsetAt(t: number, d: number): Point {
        return sum(this.pointAt(t), mult(d, this.normalAt(t)));
    }
    // eslint-disable-next-line "@typescript-eslint/no-unused-vars"
    public curvatureAt(t: number): number {
        return 1 / this.r;
    }

    public reverse() {
        return new Circle(this.c, -this.r);
    }

    public clone() {
        return new Circle(v2(this.c.x, this.c.y), this.r);
    }

    public offset(d: number) {
        // positive r is clockwise, then positive d is inwards, so r should be less positive
        // negative r is ccw, then positive d is outwards, so r should be more negative
        return new Circle(this.c, this.r - d);
    }

    public translate(v: Point) {
        return new Circle(this.c.translate(v), this.r);
    }

    public rotate(a: number, c: Point) {
        return new Circle(this.c.rotate(a, c), this.r);
    }
    public scale(factor: number, c: Point) {
        return new Circle(this.c.scale(factor, c), this.r * factor);
    }

    public findClosestPoint(p: Point) {
        const v = diff(p, this.c);
        const d = norm(v) - Math.abs(this.r);
        const point = this.project(p);
        const t = angle(v) / TAU;
        return { t, point, distance: Math.abs(d) };
    }

    public mirror(l: Line) {
        // mirror the center, invert the radius
        return new Circle(l.reflectPoint(this.c), -this.r);
    }

    /**
     * gets points that enumerate quarter segments on a circle
     * start with the point at startAngle, then point on every whole
     * quarter, then end point
     *
     *
     */
    public getSegmentPoints(startAngle: number, endAngle: number): Point[] {
        //b just the center if the circle has no radius
        if (!this.r) return [this.c];

        const q = Math.PI / 2; //quarter turn
        const ccw = this.counterClockwise; //startAngle > endAngle;
        startAngle = normalizeAngle(startAngle);
        let pa = startAngle;
        endAngle = normalizeAngle(endAngle);
        const points: Point[] = [];
        // points.push(this.pointAtAngle(startAngle))
        // console.log(ccw);
        if (ccw) {
            if (startAngle <= endAngle) startAngle += TAU;
            points.push(this.pointAtAngle(startAngle));
            // decrease angle to get to endAngle
            // round down to quarter
            let a = q * Math.floor(startAngle / q);
            if (a === startAngle) a -= q;
            // keep adding quarters until end
            while (a > endAngle) {
                // add intersection between tangents of previous point and current point
                const c = Line.intersection(
                    this.tangentAtAngle(pa),
                    this.tangentAtAngle(a)
                ); //|| points[points.length - 1];

                if (c) points.push(c);
                // points.push(this.pointAtAngle(a));
                pa = a;
                a -= q;
            }
            const c = Line.intersection(
                this.tangentAtAngle(pa),
                this.tangentAtAngle(endAngle)
            ); //|| points[points.length - 1];
            if (c) points.push(c);
            points.push(this.pointAtAngle(endAngle));
        } else {
            if (startAngle >= endAngle) startAngle -= TAU;
            points.push(this.pointAtAngle(startAngle));
            // increase angle to get to endAngle
            let a = q * Math.ceil(startAngle / q);
            if (a === startAngle) a += q;
            // keep adding quarters until end
            while (a < endAngle) {
                // add intersection between tangents of previous point and current point
                const c = Line.intersection(
                    this.tangentAtAngle(pa),
                    this.tangentAtAngle(a)
                ); //|| points[points.length - 1];

                if (c) points.push(c);
                // points.push(this.pointAtAngle(a));
                pa = a;
                a += q;
            }
            const c = Line.intersection(
                this.tangentAtAngle(pa),
                this.tangentAtAngle(endAngle)
            ); //|| points[points.length - 1];
            if (c) points.push(c);
            points.push(this.pointAtAngle(endAngle));
        }
        return points;
    }

    /**
     * projection of p on the circle
     */
    public project(p: Point): Point {
        return this.pointAtAngle(this.angleOfPoint(p));
    }

    /**
     * signed distance function, negative is inside circle
     */
    public distanceToPoint(p: Point): number {
        return distance(p, this.c) - Math.abs(this.r);
    }

    /**
     * get point at given angle in radians
     * 0 is right side of the circle, running counter clockwise
     */
    public pointAtAngle(angle: number): Point {
        return v2(
            this.c.x + Math.abs(this.r) * Math.cos(angle),
            this.c.y + Math.abs(this.r) * Math.sin(angle)
        );
    }

    /**
     * gets the angle of the line from the given point to the circle center
     */
    public angleOfPoint(point: Point) {
        const v = diff(point, this.c);
        return angle(v);
    }

    // outward normal
    public normalAtPoint(pt: Point): Point {
        return unit(diff(pt, this.c));
    }

    // direction in
    public directionAtPoint(pt: Point): Point {
        return mult(this.handedness, rotateRight(this.normalAtPoint(pt)));
    }

    public tangentAtAngle(angle: number): Line {
        const pt = this.pointAtAngle(angle);
        const dir = this.directionAtPoint(pt);
        return Line.fromPointAndDirection(pt, mult(Math.sign(this.r), dir));
    }

    /** determines whether a point is inside or on a circle */
    public pointInside(p: Point): boolean {
        return Math.abs(this.r) - norm(diff(p, this.c)) > 1e-5;
    }
    /** determines whether a point is on the circle, within uncertainty */
    public pointOn(p: Point): boolean {
        const d = norm(diff(this.c, p));
        return Math.abs(d - Math.abs(this.r)) < 1e-5;
    }

    public contains(other: Circle): boolean {
        return Circle.inside(other, this);
    }
    public inside(other: Circle): boolean {
        return Circle.inside(this, other);
    }
    public insideOrOn(other: Circle): boolean {
        return Circle.insideOrOn(this, other);
    }
    public overlaps(other: Circle): boolean {
        return Circle.overlaps(this, other);
    }

    public tangentToPoint(to: Point): LineSegment[] {
        if (this.pointOn(to)) return [new LineSegment(to, to)];
        return Circle.tangent(this, new Circle(to, 0));
    }

    public tangentFromPoint(from: Point): LineSegment[] {
        if (this.pointOn(from)) return [new LineSegment(from, from)];
        return Circle.tangent(new Circle(from, 0), this);
    }

    /** gets two tangents from a point to the circle, if point outside */
    public tangentsFromPoint(p: Point): LineSegment[] {
        return this.tangentToPoint(p).concat(this.tangentFromPoint(p));
    }

    public intersectWithLine(line: Line) {
        // get distance from center to line
        const d = line.distanceToPoint(this.c);
        // if distance is same as radius, one intersection (tangent)
        if (Math.abs(Math.abs(d) - Math.abs(this.r)) < 1e-5) {
            const p = line.project(this.c);
            return [p];
        }
        // if distance is larger than radius, no intersection
        if (Math.abs(d) > Math.abs(this.r)) return [];
        // otherwise two intersections
        const p = line.project(this.c);
        const h = Math.sqrt(this.r * this.r - d * d);
        const dir = line.direction();
        const offset = mult(h, unit(dir));
        return [sum(p, offset), diff(p, offset)];
    }

    public getBoundingBox(): [Point, Point] {
        const r = Math.abs(this.r);
        const rr = v2(r, r);
        return [diff(this.c, rr), sum(this.c, rr)];
    }

    public get left() {
        return { x: this.c.x - Math.abs(this.r), y: this.c.y };
    }
    public get right() {
        return { x: this.c.x + Math.abs(this.r), y: this.c.y };
    }

    public get top() {
        return { x: this.c.x, y: this.c.y - Math.abs(this.r) };
    }
    public get bottom() {
        return { x: this.c.x, y: this.c.y + Math.abs(this.r) };
    }

    public walk({ enter, exit }: WalkerOptions): this {
        let r = this;
        if (enter) {
            r = enter(r) || r;
        }
        const newCenter = r.c.walk({ enter, exit });
        if (newCenter !== r.c) {
            r = this.copyIdentity(new Circle(newCenter, r.r)) as this;
        }
        if (exit) {
            r = exit(r) || r;
        }
        return r;
    }
    public flatten(): BaseGeometry[] {
        return [this, ...this.c.flatten()];
    }

    public toSVG() {
        const r = Math.abs(this.r);
        const lf = 0; //always the small arc, as we devided in two
        const sf = Math.sign(this.r) === 1 ? 1 : 0; // sweep flag
        const p1 = sum(this.c, v2(Math.abs(r), 0));
        const p2 = diff(this.c, v2(Math.abs(r), 0));
        return (
            `M ${p1.x} ${p1.y} ` +
            `A ${r} ${r} 0 ${lf} ${sf} ${p2.x} ${p2.y} ` +
            `A ${r} ${r} 0 ${lf} ${sf} ${p1.x} ${p1.y}`
        );
    }

    public toString() {
        return `<Circle>`;
    }

    /**
     * construct a circle from two points and a tangent direction through the first
     */
    static fromPointsAndTangent(p1: Point, p2: Point, tangent: Point) {
        // find the circle tangent to the last point and though the through point
        const normal = rotateLeft(tangent);
        if (same(p1, p2)) return null;
        // bisector line through both points, center is on this line

        const line1 = Line.perpendicularFromPoints(p1, p2);
        // normal from tangent and p1, center is also on this line
        const line2 = Line.fromPointAndDirection(p1, normal);
        // intersection is the center
        const c = Line.intersection(line1, line2);

        if (!c) return null;
        const r = norm(diff(p1, c));

        return new Circle(c, r);
    }

    static fromTangentBisectorAndPoint(l1: Line, bs: Line, p: Point) {
        const o = Line.intersection(l1, bs);
        if (!o) return null;

        // x and y coordinates of point with respect to l1 (rotated reference frame)
        // let u = dot(l1.direction(), diff(p1, o));
        // let v = norm(diff(p, p1));
        // console.log(l1.angle());
        const al1 = l1.angle();
        // project into l1 coordinate frame with o at center
        const uv = rot(-al1, diff(p, o));
        const u = uv.x;
        const v = uv.y;
        // parabola around (u,v) and x axis given by (x−u)²+v²=2vy
        // -> (1/2v)x² - (u/v)x + (u²/2v + v/2);
        // -> write as ax² + bx + c
        const a_p = 1 / (2 * v);
        const b_p = -u / v;
        const c_p = (u * u) / (2 * v) + v / 2;

        // angle of bisector in l1 reference frame
        const ab = bs.angle() - al1;
        // slope of the bs line
        const a_b = Math.tan(ab);

        let s = v2(0, 0);
        if (Math.abs(a_b) < 1e5) {
            // solve quadratic equation
            // aₚx² + bₚx + cₚ = aᵦx
            const a = a_p;
            const b = b_p - a_b;
            const c = c_p;

            // discriminant
            const d2 = b * b - 4 * a * c;
            if (d2 < 0) {
                // no solutions
                return null;
            }
            const d = Math.sqrt(d2);
            // solutions for x
            const x1 = (-b - d) / (2 * a);
            const x2 = (-b + d) / (2 * a);
            // solutions for y, given the bisector
            const y1 = a_b * x1;
            const y2 = a_b * x2;
            // these solutions are in l1 reference frame, so project back
            const s1 = v2(x1, y1);
            const s2 = v2(x2, y2);
            s = s1;
            if (distance(s2, o) < distance(s1, o)) s = s2;
        } else {
            // bisector is near vertical, solution is o,c
            s = v2(0, c_p);
        }

        // back project
        s = sum(o, rot(al1, s));

        const handedness = cross(l1.direction(), bs.direction());
        return Circle.fromCenterAndPoint(s, p, handedness < 0);
    }

    static fromTangentLinesAndPoint(l1: Line, l2: Line, p: Point) {
        const o = Line.intersection(l1, l2);
        if (!o) return null;

        // bisector through o
        const bs = Line.fromPointAndDirection(
            o,
            diff(l2.direction(), l1.direction())
        );

        return this.fromTangentBisectorAndPoint(l1, bs, p);
    }

    static fromTangentLinesAndRadius(l1: Line, l2: Line, r: number) {
        // mostly the same as elbow from arc.ts
        const p2 = Line.intersection(l1, l2);
        if (!p2) return null;
        //unit vectors in the from and to direction relative to apex
        const a = mult(-1, l1.direction());
        const b = l2.direction();
        //dot product, for repeated use
        const dp = dot(a, b);
        if (Math.abs(Math.abs(dp) - 1) < 0.0001) {
            //colinear
            return null;
        }

        //orthogonal unit vectors to a and b, with length r
        let c = unit(diff(b, mult(dp, a)));
        let d = unit(diff(a, mult(dp, b)));
        //half the angle between the vectors
        const α = Math.acos(dp) / 2;
        //distance along the vectors for the waypoints
        const tα = Math.tan(α);
        const s = r / tα;

        c = mult(r, c);
        d = mult(r, d);

        //waypoints: start and end points of the curve
        const e = sum(p2, mult(s, a));
        //swap if curve is counterclockwise
        const ccw = cross(c, d) < 0;

        return new Circle(sum(e, c), ccw ? -r : r);
    }

    /**
     * direction determined by 3rd parameter
     */
    static fromCenterAndPoint(c: Point, p: Point, ccw = false) {
        const r = norm(diff(p, c));
        return new Circle(c, ccw ? -r : r);
    }

    /**
     * creates a circle defined by three points on the perimeter
     * so, the outer circle of a triangle
     */
    static fromThreePoints(p1: Point, p2: Point, p3: Point) {
        // TODO: implement
        const a = diff(p2, p1);
        const b = diff(p3, p2);
        const handedness = Math.sign(cross(a, b));
        const l1 = Line.perpendicularFromPoints(p1, p2);
        const l2 = Line.perpendicularFromPoints(p2, p3);
        const c = Line.intersection(l1, l2);
        if (!c || !handedness) return null;
        const r = norm(diff(p1, c));
        return new Circle(c, handedness * r);
    }

    /**
     * construct a circle from two opposing points. center is in the middle
     */
    static fromOpposingPoints(p1: Point, p2: Point, ccw = false) {
        const c = mid(p1, p2);
        const r = norm(diff(c, p1));
        return new Circle(c, ccw ? -r : r);
    }

    /** gets 1 or 0 tangent for signed circles */
    static tangent(from: Circle, to: Circle): LineSegment[] {
        // no tangent possible if circles contained in eachother
        if (from.inside(to)) return [];
        if (to.inside(from)) return [];
        // no tangent possible if overlap and different radius
        if (from.handedness === -to.handedness && from.overlaps(to)) return [];

        const d = diff(to.c, from.c);
        const du = unit(d); // unit vector towards other circle
        const dr = from.r - to.r; //positive
        const ca = Math.max(-1, Math.min(1, dr / norm(d))); // clamp to prevent rounding errors
        const a = Math.acos(ca);
        const dv = rot(-a, du); //unit vector from center to tangent point
        // if (isNaN(dv.x)) {
        //     console.log(from, to, d, du, dr, dr / norm(d), a, dv);
        // }
        return [
            new LineSegment(
                sum(from.c, mult(from.r, dv)),
                sum(to.c, mult(to.r, dv))
            ),
        ];
    }

    static tangents(from: Circle, to: Circle): LineSegment[] {
        // no tangent possible if circles contained in eachother
        if (from.inside(to)) return [];
        if (to.inside(from)) return [];

        const d = diff(to.c, from.c); // vector between centers
        const du = unit(d); // unit vector in that direction
        const dr = from.r - to.r; // difference in radii, positive if from is larger
        const a = Math.acos(dr / norm(d)); // angle of the tangent point
        const dv1 = rot(a, du);
        const dv2 = rot(-a, du);
        return [
            new LineSegment(
                sum(from.c, mult(from.r, dv1)),
                sum(to.c, mult(to.r, dv1))
            ),
            new LineSegment(
                sum(from.c, mult(from.r, dv2)),
                sum(to.c, mult(to.r, dv2))
            ),

            // new LineSegment(from.c, sum(from.c, mult(from.r, dv1))),
            // new LineSegment(from.c, sum(from.c, mult(from.r, dv2))),
            // new LineSegment(to.c, sum(to.c, mult(to.r, dv1))),
            // new LineSegment(to.c, sum(to.c, mult(to.r, dv2))),
            // ...new Circle(from.c, dr)
            //     .tangentsFromPoint(to.c)
            //     .map((l) => l.translate(mult(-dr, dv1))),
            // ...new Circle(to.c, -dr).tangentsFromPoint(from.c),
        ];
    }

    static same(c1: Circle, c2: Circle) {
        return same(c1.c, c2.c) && c1.r === c2.r;
    }

    static overlaps(c1: Circle, c2: Circle) {
        return norm(diff(c2.c, c1.c)) < Math.abs(c1.r) + Math.abs(c2.r);
    }
    static inside(c1: Circle, isIn: Circle) {
        // if (!c1.r) return isIn.pointInside(c1.c);
        return (
            norm(diff(c1.c, isIn.c)) - (Math.abs(isIn.r) - Math.abs(c1.r)) <
            -1e-5
        );
    }
    static insideOrOn(c1: Circle, isIn: Circle) {
        return norm(diff(c1.c, isIn.c)) <= Math.abs(isIn.r) - Math.abs(c1.r);
    }

    static intersect(c1: Circle, c2: Circle): Point[] {
        // if separated by more that sum of radii, no intersection
        const d = norm(diff(c2.c, c1.c));
        if (d > Math.abs(c1.r) + Math.abs(c2.r)) return [];
        // if same, no intersection
        if (Circle.same(c1, c2)) return [];
        // if tangent, one intersection
        if (Math.abs(d - (Math.abs(c1.r) + Math.abs(c2.r))) < 1e-5) {
            const p = sum(
                c1.c,
                mult(
                    Math.abs(c1.r) / (Math.abs(c1.r) + Math.abs(c2.r)),
                    diff(c2.c, c1.c)
                )
            );
            return [p];
        }
        // if one circle is contained in the other, no intersection
        if (d < Math.abs(Math.abs(c1.r) - Math.abs(c2.r))) return [];
        // otherwise two intersections
        const a = (c1.r * c1.r - c2.r * c2.r + d * d) / (2 * d);
        const h = Math.sqrt(c1.r * c1.r - a * a);
        const p = sum(c1.c, mult(a / d, diff(c2.c, c1.c)));
        const rx = -(c2.c.y - c1.c.y) * (h / d);
        const ry = (c2.c.x - c1.c.x) * (h / d);
        return [v2(p.x + rx, p.y + ry), v2(p.x - rx, p.y - ry)];
    }
}
