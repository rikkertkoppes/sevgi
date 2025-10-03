import { uid } from "./Util";
import { Point } from "./Vector";

export interface WalkerOptions {
    enter?: <G extends BaseGeometry>(g: G) => G | void;
    exit?: <G extends BaseGeometry>(g: G) => G | void;
}

export abstract class BaseGeometry {
    public _id: string;
    constructor() {
        this._id = uid();
    }
    protected copyIdentity<G extends BaseGeometry>(to: G): G {
        to._id = this._id;
        return to;
    }
    abstract type: string;
    abstract clone(): BaseGeometry;
    abstract translate(v: Point): BaseGeometry;
    abstract rotate(angle: number, center: Point): BaseGeometry;
    abstract scale(factor: number, center: Point): BaseGeometry;

    abstract walk({ enter, exit }: WalkerOptions): this;
    abstract flatten(): BaseGeometry[];

    abstract toString(): string;
    abstract toSVG(): any;
}
