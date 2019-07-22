import {FpCommon} from "./fp-common";
import {FP2} from "./fp2";
import {FP} from "./fp";
import {FP8} from "./fp8";

export class FP4 extends FpCommon<FP4> {

    public constructor(c: FP4 | FP2, d: FP4 | FP2);

    public isunity(): boolean;

    public isreal(): boolean;

    public real(): FP4;

    public geta(): FP4;

    public getb(): FP4;

    public set(c: FP2, D: FP2): void;

    public seta(c: FP2): void;

    public conj(): void;

    public nconj(): void;

    public pmul(s: FP8): void;

    public timesi(): void;

    public xtr_A(w: FP4, y: FP4, z: FP4): void;

    public xtr_D(): FP4;

    public div2(): void;

    public div_i(): void;

    public div_2i(): void;

    public qmul(s: FP): void;

}
