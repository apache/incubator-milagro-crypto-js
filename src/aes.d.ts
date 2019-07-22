export class AES {
    public readonly ECB: number;
    public readonly CBC: number;
    public readonly CFB1: number;
    public readonly CFB2: number;
    public readonly CFB4: number;
    public readonly OFB1: number;
    public readonly OFB2: number;
    public readonly OFB4: number;
    public readonly OFB8: number;
    public readonly OFB16: number;
    public readonly CTR1: number;
    public readonly CTR2: number;
    public readonly CTR4: number;
    public readonly CTR8: number;
    public readonly CTR16: number;

    public reset(m: number, iv: ArrayLike<number>): void;

    public getreg(): number[];

    public increment(): void;

    public init(m: number, nk: number, key: ArrayLike<number>, iv: ArrayLike<number>): void;

    public ecb_encrypt(buff: ArrayLike<number>): void;

    public ecb_decrypt(buff: ArrayLike<number>): void;

    public encrypt(buf: ArrayLike<number>): number;

    public decrypt(buf: ArrayLike<number>): number;

    public end(): void;

    public static ROTL8(x: number): number;

    public static ROTL16(x: number): number;

    public static ROTL24(x: number): number;

    public static pack(b: number): number;

    public static unpack(a: number): number;

    public static bmul(a: number, b: number): number;

    public static SubByte(a: number): number;

    public static product(a: number, b: number): number;

    public static InvMixCol(x: number): number;
}
