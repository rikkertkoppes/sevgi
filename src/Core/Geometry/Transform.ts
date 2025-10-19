import { store } from "./GeoData";
import { fixedNum } from "./Util";
import { Point, v2 } from "./Vector";

export class Transform {
    public hash: string;
    private _scale: Point | null = null;
    private _rotation: number | null = null;
        public a: number,
        public b: number,
        public c: number,
        public d: number,
        public e: number,
        public f: number
    ) {
        this.hash = fixedNum`${a},${b},${c},${d},${e},${f}`;
    }

    /**
     * applies this transform followed by other
     * @param other
     * @returns
     */
    public multiply(other: Transform): Transform {
        return new Transform(
            this.a * other.a + this.c * other.b,
            this.b * other.a + this.d * other.b,
            this.a * other.c + this.c * other.d,
            this.b * other.c + this.d * other.d,
            this.a * other.e + this.c * other.f + this.e,
            this.b * other.e + this.d * other.f + this.f
        );
    }

    /**
     * matrix transformation
     *
     *  |x|   |a c e| |x|
     *  |y| = |b d f| |y|
     *  |1|   |0 0 1| |1|
     */
    public apply(p: Point): Point {
        return new Point(
            this.a * p.x + this.c * p.y + this.e,
            this.b * p.x + this.d * p.y + this.f
        );
    }

    public inverse(): Transform {
        // check cache
        const prop = store.getProp(this.hash, "inverse");
        if (prop) {
            return prop;
        }

        const det = this.a * this.d - this.b * this.c;
        if (Math.abs(det) < 1e-10) {
            throw new Error("matrix not invertible");
        }
        const idet = 1 / det;
        const t = new Transform(
            this.d * idet,
            -this.b * idet,
            -this.c * idet,
            this.a * idet,
            (this.c * this.f - this.d * this.e) * idet,
            (this.b * this.e - this.a * this.f) * idet
        );
        store.setProp(this.hash, "inverse", t);
        return t;
    }

    public get translation(): Point {
        return new Point(this.e, this.f);
    }
    public get scale(): Point {
        if (!this._scale) {
            const sx = Math.sqrt(this.a * this.a + this.b * this.b);
            const sy = Math.sqrt(this.c * this.c + this.d * this.d);
            this._scale = new Point(sx, sy);
        }
        return this._scale;
    }
    public get rotation(): number {
        if (this._rotation === null) {
            this._rotation = Math.atan2(this.b, this.a);
        }
        return this._rotation;
    }

    public static fromTranslation(p: Point): Transform {
        return new Transform(1, 0, 0, 1, p.x, p.y);
    }

    public static fromRotation(angle: number): Transform {
        const cos = angle ? Math.cos(angle) : 1;
        const sin = angle ? Math.sin(angle) : 0;
        return new Transform(cos, sin, -sin, cos, 0, 0);
    }

    public static fromScaling(s: number | Point): Transform {
        const scale = typeof s === "number" ? v2(s, s) : s;
        return new Transform(scale.x, 0, 0, scale.y, 0, 0);
    }

    public static from(
        t = Point.ZERO,
        r = 0,
        s: number | Point = Point.ONE
    ): Transform {
        const cos = r ? Math.cos(r) : 1;
        const sin = r ? Math.sin(r) : 0;
        const scale = typeof s === "number" ? v2(s, s) : s;
        return new Transform(
            scale.x * cos,
            scale.x * sin,
            -scale.y * sin,
            scale.y * cos,
            t.x,
            t.y
        );
    }

    public static fromDOM(m: DOMMatrix): Transform {
        return new Transform(m.a, m.b, m.c, m.d, m.e, m.f);
    }

    public static ONE = new Transform(1, 0, 0, 1, 0, 0);
}
