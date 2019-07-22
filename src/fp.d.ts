import {BIG, DBIG} from "./big";
import {FpCommon} from "./fp-common";

export class FP extends FpCommon<FP> {

    public constructor(x: FP | BIG);

    public static logb2(v: number): number;
    public static mod(d: DBIG): BIG;

    public rcopy(y: FP): void;
    public bcopy(y: FP): void;
    public cswap(b: FP, d: number): void;
    public nres(): FP;
    public redc(): BIG;
    public norm(): number;
    public mul(b: FP): FP;
    public sqr(): FP;
    public add(b: FP): FP;
    public neg(): FP;
    public sub(b: FP): FP;
    public div2(): FP;
    public fpow(): FP;
    public inverse(): FP;
    public jacobi(): number;
    public sqrt(): FP;

}
