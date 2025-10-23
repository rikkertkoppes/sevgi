// prng.ts
// Fast, deterministic PRNG (xoshiro128**) with numeric-only seeding.

function rotl(x: number, k: number): number {
    return ((x << k) | (x >>> (32 - k))) >>> 0;
}

/** SplitMix32-style generator using MurmurHash3 finalizer. */
function splitmix32(seed: number): () => number {
    let s = seed >>> 0 || 0; // normalize to uint32
    return () => {
        s = (s + 0x9e3779b9) >>> 0; // Weyl sequence
        let z = s ^ (s >>> 16);
        z = Math.imul(z, 0x85ebca6b) >>> 0;
        z ^= z >>> 13;
        z = Math.imul(z, 0xc2b2ae35) >>> 0;
        z ^= z >>> 16;
        return z >>> 0; // uint32
    };
}

/** Expand a numeric seed into 4 uint32 words for xoshiro128**. */
function seedToState(seed: number): Uint32Array {
    const next = splitmix32(seed);
    const s0 = next(),
        s1 = next(),
        s2 = next(),
        s3 = next();
    // Avoid the all-zero state
    if ((s0 | s1 | s2 | s3) === 0) {
        return new Uint32Array([
            0x9e3779b9, 0x243f6a88, 0xb7e15162, 0x8aed2a6b,
        ]);
    }
    return new Uint32Array([s0, s1, s2, s3]);
}

export class PRNG {
    private s: Uint32Array;

    constructor(seed: number) {
        this.s = seedToState(seed);
    }

    /** xoshiro128** core; returns a uint32 */
    nextUint32(): number {
        let s0 = this.s[0],
            s1 = this.s[1],
            s2 = this.s[2],
            s3 = this.s[3];

        const result = Math.imul(rotl(Math.imul(s0, 5) >>> 0, 7), 9) >>> 0;

        const t = (s1 << 9) >>> 0;

        s2 ^= s0;
        s3 ^= s1;
        s1 ^= s2;
        s0 ^= s3;
        s2 ^= t;
        s3 = rotl(s3, 11);

        this.s[0] = s0 >>> 0;
        this.s[1] = s1 >>> 0;
        this.s[2] = s2 >>> 0;
        this.s[3] = s3 >>> 0;

        return result >>> 0;
    }

    /** Float in [0, 1) */
    next(): number {
        return this.nextUint32() / 0x100000000;
    }

    /** Uniform integer in [0, max) */
    int(max: number): number {
        if (!Number.isFinite(max) || max <= 0)
            throw new Error("max must be > 0");
        const range = max >>> 0;
        const threshold = 0x100000000 % range >>> 0;
        while (true) {
            const r = this.nextUint32();
            if (r >>> 0 >= threshold) return r % range >>> 0;
        }
    }
}
