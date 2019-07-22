import {RNG} from "./rand";

export class BIG {

    public readonly CHUNK: number;
    public readonly MODBYTES: number;
    public readonly BASEBITS: number;
    public readonly NLEN: number;
    public readonly DNLEN: number;
    public readonly BMASK: number;
    public readonly BIGBITS: number;
    public readonly NEXCESS: number;
    public readonly MODINV: number;

    constructor(x?: number | BIG);

    public static frombytearray(array: ArrayLike<number>, offset: number): BIG;
    public static fromBytes(array: ArrayLike<number>): BIG;
    public static smul(a: BIG, b: BIG): BIG;
    public static comp(a: BIG, b: BIG): number;
    public static random(rng: RNG): BIG;
    public static randomnum(q: BIG, rng: RNG): BIG;
    public static mul(a:BIG, b: BIG): DBIG;
    public static sqr(a:BIG): DBIG;
    public static monty(m:BIG, nd: number, d: BIG): BIG;
    public static modmul(a1:BIG, b1: BIG, m: BIG): BIG;
    public static modsqr(a1:BIG, m: BIG): BIG;
    public static modneg(a1:BIG, m: BIG): BIG;
    public static invmod256(a:BIG): BIG;

    public zero(): BIG;
    public one(): BIG;
    public get(i: number): number;
    public set(i: number, x: number): void;
    public iszilch(): boolean;
    public isunity(): boolean;
    public cswap(a: number, b: number): void;
    public cmove(a: number, b: number): void;
    public copy(y: BIG): BIG;
    public hcopy(y: DBIG): BIG;
    // public rcopy(y: ROM): BIG;
    public xortop(x: number): void;
    public ortop(x: number): void;
    public norm(): number;
    public fshr(k: number): number;
    public shr(k: number): BIG;
    public fshl(k: number): number;
    public shl(k: number): BIG;
    public nbits(): number;
    public toString(): string;
    public add(v: BIG): BIG;
    public or(v: BIG): BIG;
    public plus(v: BIG): BIG;
    public inc(i: number): BIG;
    public sub(y: BIG): BIG;
    public rsub(y: BIG): BIG;
    public dec(y: number): BIG;
    public minus(y: BIG): BIG;
    public imul(y: number): BIG;
    public tobytearray(array: ArrayLike<number>, offset: number): BIG;
    public toBytes(array: ArrayLike<number>): void;
    public muladd(x: number, y: number, c: number, i: number): number;
    public pmul(c: number): number;
    public pxmul(c: number): DBIG;
    public div3(): number;
    public mod2m(m: number): void;
    public invmod2m(): void;
    public mod(m: BIG): void;
    public div(m1: BIG): void;
    public parity(): number;
    public bit(n: number): boolean;
    public lastbits(n: number): number;
    public isok(): boolean;
    public jacobi(p: BIG): number;
    public invmodp(p: BIG): void;
    public powmod(e1: BIG, m: BIG): BIG;
}

export class DBIG {

    constructor(x: number);

    public zero(): DBIG;
    public copy(y: DBIG): DBIG;
    public hcopy(y: BIG): DBIG;
    public ucopy(y: DBIG): BIG;
    public norm(): DBIG;
    public muladd(x: number, y: number, c: number, i: number): DBIG;
    public shr(k: number): BIG;
    public shl(k: number): BIG;
    public cmove(a: DBIG, b: DBIG): void;
    public add(v: DBIG): void;
    public sub(y: DBIG): void;
    public rsub(y: BIG): void;
    public nbits(): number;
    public toString(): string;
    public mod(m: BIG): BIG;
    public div(c: BIG): DBIG;
    public split(n: number): BIG;
    public comp(a: DBIG, b: DBIG): number;

}
