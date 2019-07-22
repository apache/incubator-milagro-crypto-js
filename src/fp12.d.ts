import {FpCommon} from "./fp-common";
import {FP4} from "./fp4";
import {FP2} from "./fp2";
import {FP} from "./fp";
import {BIG} from "./big";

export class FP12 extends FpCommon<FP12> {

    public constructor(d?: FP4 | FP2 | FP | number, e?: FP4 | FP2 | FP, f?: FP4 | FP2 | FP);

    public static fromBytes(w: ArrayLike<number>): FP12;

    public static teq(b: number, c: number): number;

    public static pow4(q:ArrayLike<number>, u: ArrayLike<number>): FP12;

    public isunity(): boolean;

    public select(g: ArrayLike<number>, b: number): void;

    public settype(w: number): void;

    public geta(): FP4;

    public getb(): FP4;

    public getc(): FP4;

    public conj(): void;

    public set(d: FP4, e: FP4, f: FP4): void;

    public seta(d: FP4): void;

    public usqr(): void;

    public smul(y: FP12): void;

    public ssmul(y: FP12): void;

    public frob(f: FP2 | FP): void;

    public trace(): FP4;

    public toBytes(w: ArrayLike<number>): void;

    public pinpow(e: BIG, bts: number): void;

    public compow(e: BIG, r: BIG): void;
}
