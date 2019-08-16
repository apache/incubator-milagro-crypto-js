import {RNG} from "./rand";
import {ECP} from "./ecp";

export class ECDH {

    readonly SHA256: number;
    readonly SHA384: number;
    readonly SHA512: number;

    new(): ECDH;

    inttobytes(n: number, len: number): number[];

    bytestostring(b: ArrayLike<number>): string;

    stringtobytes(s: string): number[];

    hashit(shaVersion: number, a: ArrayLike<number>, n: number, b: ArrayLike<number>, pad: number): number[];

    KDF1(shaVersion: number, z: ArrayLike<number>, olen: number): number[];

    KDF2(shaVersion: number, z: ArrayLike<number>, p: ArrayLike<number>, olen: number): number[];

    PBKDF2(shaVersion: number, pass: ArrayLike<number>, salt: ArrayLike<number>, rep: number, olen: number): number[]

    HMAC(shaVersion: number, m: ArrayLike<number>, k: ArrayLike<number>, tag: ArrayLike<number>);

    AES_CBC_IV0_ENCRYPT(k: ArrayLike<number>, m: ArrayLike<number>): number[];

    AES_CBC_IV0_DECRYPT(k: ArrayLike<number>, c: ArrayLike<number>): number[];

    KEY_PAIR_GENERATE(rng: RNG, s: ArrayLike<number>, w: ArrayLike<number>, c: boolean): number;

    PUBLIC_KEY_VALIDATE(w: ArrayLike<number>): number;

    ECPSVDP_DH(s: ArrayLike<number>, w: ArrayLike<number>, k: ArrayLike<number>): number;

    ECPSP_DSA(shaVersion: number, rng: RNG, s: ArrayLike<number>, f: ArrayLike<number>, c: ArrayLike<number>, d: ArrayLike<number>): number;

    ECPVP_DSA(shaVersion: number, w: ArrayLike<number>, f: ArrayLike<number>, c: ArrayLike<number>, d: ArrayLike<number>): number;

    ECIES_ENCRYPT(shaVersion: number, p1: ArrayLike<number>, p2: ArrayLike<number>, rng: RNG, w: ArrayLike<number>, m: ArrayLike<number>, v: ArrayLike<number>, t: ArrayLike<number>): number[];

    ncomp(t1: ArrayLike<number>, t2: ArrayLike<number>, n: number);

    ECIES_DECRYPT(shaVersion: number, p1: ArrayLike<number>, p2: ArrayLike<number>, v: ArrayLike<number>, c: ArrayLike<number>, t: ArrayLike<number>, u: ArrayLike<number>): number[];
}
