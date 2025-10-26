import { BoundingBox } from "./BoundingBox";
import { Transform } from "./Transform";
import { uid } from "./Util";
import { Point } from "./Vector";

export interface WalkerOptions {
    enter?: <G extends BaseGeometry>(g: G) => G | void;
    exit?: <G extends BaseGeometry>(g: G) => G | void;
}

export abstract class BaseGeometry {
    /**
     * this is a unique id for this geometry instance
     */
    public id: string;
    /**
     * the _id is an ancestry id, shared by all cloned versions of this geometry
     */
    public ancestryId: string;
    /**
     * the hash is a content hash, changes when the geometry changes
     */
    public hash: string = "";
    abstract type: string;
    constructor() {
        this.id = uid();
        this.ancestryId = uid();
    }
    abstract get boundingBox(): BoundingBox;
    protected copyAncestry<G extends BaseGeometry>(to: G): G {
        to.ancestryId = this.ancestryId;
        return to;
    }
    public makeUnique(): this {
        this.ancestryId = uid();
        return this;
    }
    public clone(): this {
        return this.shallowCopy();
    }
    protected shallowCopy(): this {
        const c = Object.create(Object.getPrototypeOf(this));
        Object.assign(c, this, { id: uid() });
        return c;
    }

    abstract transform(T: Transform): BaseGeometry;
    abstract translate(v: Point): BaseGeometry;
    abstract rotate(angle: number, center: Point): BaseGeometry;
    abstract scale(factor: number, center: Point): BaseGeometry;

    abstract walk({ enter, exit }: WalkerOptions): this;
    abstract flatten(): BaseGeometry[];

    toString(): string {
        return `<${this.type}>`;
    }
    abstract toSVG(): any;
}
