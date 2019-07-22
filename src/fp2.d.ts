import {FpCommon} from "./fp-common";
import {FP} from "./fp";
import {BIG} from "./big";
import {FP8} from "./fp8";

export class FP2 extends FpCommon<FP2> {

    public constructor(c: FP2 | FP | BIG, d?: FP2 | FP | BIG);

    public getA(): BIG;

    public getB(): BIG;

    public set(c: FP, D: FP): void;

    public seta(c: FP): void;

    public bset(c: BIG, d: BIG): void;

    public bseta(c: BIG): void;

    public conj(): void;

    public pmul(s: FP8): void;

    public div2(): void;

    public timesi(): void;

    public mul_ip(): void;

    public div_ip(): void;
}
