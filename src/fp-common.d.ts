import {BIG} from "./big";

export class FpCommon<T> {

    public reduce(): void;

    public norm(): void;

    public iszilch(): boolean;

    public cmove(b: T, d: number): void;

    public equals(b: T): boolean;

    public copy(y: T): void;

    public zero(): void;

    public one(): void;

    public neg(): void;

    public add(x: T): void;

    public sub(x: T): void;

    public rsub(b: T): void;

    public imul(b: number): T;

    public sqr(): void;

    public mul(x: T): void;

    public toString(): string;

    public inverse(): void;

    public sqrt(): boolean;

    public pow(e: BIG): T;
}
